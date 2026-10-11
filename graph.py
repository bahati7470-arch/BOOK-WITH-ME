import json
import re
from datetime import date, timedelta

from config import settings
from agent.state import AgentState
from services.amadeus import amadeus
from services.ranking import rank_hotels


async def parse_intent(state: AgentState) -> AgentState:
    intent = _fallback_intent(state["message"])

    if settings.openai_api_key:
        try:
            from langchain_openai import ChatOpenAI
            llm = ChatOpenAI(model="gpt-4o-mini", api_key=settings.openai_api_key, temperature=0.3)
            prompt = (
                f"Parse this hotel request into JSON. User: {state['message']}\n"
                f"Today is {date.today().isoformat()}.\n"
                f"Return ONLY JSON with keys: destination, checkin, checkout, nights, budget, guests."
            )
            resp = await llm.ainvoke(prompt)
            raw = resp.content.strip().strip("`").lstrip("json").strip()
            parsed = json.loads(raw)
            intent.update({k: v for k, v in parsed.items() if v})
        except Exception:
            pass

    nights = int(intent.get("nights") or 3)
    if not intent.get("checkin"):
        intent["checkin"] = (date.today() + timedelta(days=30)).isoformat()
    if not intent.get("checkout"):
        intent["checkout"] = (date.fromisoformat(intent["checkin"]) + timedelta(days=nights)).isoformat()
    intent["nights"] = (date.fromisoformat(intent["checkout"]) - date.fromisoformat(intent["checkin"])).days or nights

    state["intent"] = intent
    state["missing"] = [] if intent.get("destination") else ["destination"]
    return state


async def search_hotels(state: AgentState) -> AgentState:
    intent = state["intent"]
    city = intent.get("destination", "")
    city_code = await amadeus.city_code(city) if city else None

    state["hotels"] = await amadeus.search_hotels(
        city_code=city_code or "MBA",
        checkin=intent["checkin"],
        checkout=intent["checkout"],
        adults=int(intent.get("guests") or 1),
    )
    return state


async def rank_and_select(state: AgentState) -> AgentState:
    budget = state["intent"].get("budget")
    state["ranked"] = rank_hotels(state["hotels"], budget=budget, prefs=state.get("prefs"))
    return state


async def compose_reply(state: AgentState) -> AgentState:
    intent = state["intent"]
    ranked = state.get("ranked") or []

    if state["missing"]:
        state["reply"] = "Sure — which city or region in Kenya are you thinking of?"
        return state

    if not ranked:
        state["reply"] = f"I couldn't find hotels in {intent.get('destination','that area')} for those dates."
        return state

    top = ranked[:3]
    dest = intent.get("destination", "your destination")
    budget = intent.get("budget")
    budget_phrase = f"under ${int(budget)}" if budget else "matching your criteria"
    state["reply"] = f"Found {len(top)} options in {dest} {budget_phrase}. Which one catches your eye?"
    state["ranked"] = top
    return state


async def run_agent(message: str, history: list, prefs: dict) -> AgentState:
    state: AgentState = {
        "message": message, "history": history, "prefs": prefs,
        "hotels": [], "ranked": [], "reply": "", "intent": {}, "missing": [],
    }
    state = await parse_intent(state)
    if state["missing"]:
        return await compose_reply(state)
    state = await search_hotels(state)
    state = await rank_and_select(state)
    return await compose_reply(state)


def _fallback_intent(message: str) -> dict:
    lower = message.lower()
    intent: dict = {}
    known = ["diani", "mombasa", "nairobi", "masai mara", "mara", "naivasha",
             "nakuru", "kisumu", "malindi", "watamu", "lamu"]
    for k in known:
        if k in lower:
            intent["destination"] = k.title()
            break
    m = re.search(r"(\d+)\s*night", lower)
    if m:
        intent["nights"] = int(m.group(1))
    m = re.search(r"(?:under|below|less than|max)\s*\$?\s*(\d+)", lower)
    if m:
        intent["budget"] = float(m.group(1))
    m = re.search(r"(\d+)\s*(?:guest|people|adult)", lower)
    if m:
        intent["guests"] = int(m.group(1))
    return intent