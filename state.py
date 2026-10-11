from typing import TypedDict, List


class Hotel(TypedDict, total=False):
    id: str
    name: str
    location: str
    rating: float
    price_per_night: float
    total_price: float
    currency: str
    checkin: str
    checkout: str
    nights: int
    image: str


class AgentState(TypedDict, total=False):
    message: str
    history: list
    prefs: dict
    intent: dict
    missing: List[str]
    hotels: List[Hotel]
    ranked: List[Hotel]
    reply: str