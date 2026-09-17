# -*- coding: utf-8 -*-
"""
GoDaddy Domain Name Finder
--------------------------

Checks candidate .com domains against GoDaddy's live availability API.

IMPORTANT:
- This program ONLY checks availability.
- It does NOT purchase or register anything.
- Create a GoDaddy PAT with the domains.domain:read scope.
- For security, put your NEW PAT below. Do NOT reuse an exposed PAT.
"""
import os
from dotenv import load_dotenv

load_dotenv()
# ============================================================
# STEP 1 - YOUR GODADDY API TOKEN
# ============================================================

# Paste your NEW GoDaddy PAT between the quotes.
GODADDY_PAT = os.environ.get("GODADDY_PAT")


# ============================================================
# STEP 2 - CANDIDATE NAMES
# ============================================================

HOSTING_NAMES = [
    "SimplyHosted",
    "CleverHosted",
    "BrightlyHosted",
    "SmoothlyHosted",
    "EasilyHosted",
    "HappilyHosted",
    "CalmlyHosted",
    "NeatlyHosted",
    "SafelyHosted",
    "PerfectlyHosted",
    "SeamlesslyHosted",
    "EffortlesslyHosted",
    "NaturallyHosted",
    "ThoughtfullyHosted",
    "CarefullyHosted",
    "BeautifullyHosted",
    "BrilliantlyHosted",
    "ReliablyHosted",
    "PreciselyHosted",
    "LovinglyHosted",
    "SimplyManaged",
    "SmartlyManaged",
    "CleverlyManaged",
    "SmoothlyManaged",
    "EasilyManaged",
    "SimplyAutomated",
    "SmartlyAutomated",
    "CleverlyAutomated",
    "SmoothlyAutomated",
    "SimplyOperated",
    "SmartlyOperated",
    "CleverlyOperated",
    "SmoothlyOperated",
    "SimplyHandled",
    "SmartlyHandled",
    "CleverlyHandled",
    "SmoothlyHandled",
    "SimplyRun",
    "SmartlyRun",
    "CleverlyRun",
    "SimplyBooked",
    "SmartlyBooked",
    "CleverlyBooked",
    "SmoothlyBooked",
    "SimplyHostedCo",
    "SmartlyHostedCo",
    "CleverlyHostedCo",
    "SmoothlyHostedCo",
    "BrightlyHostedCo",
]

SOFTWARE_NAMES = [
    "Evernest",
    "Brightly",
    "Simplyfy",
    "Flowwise",
    "Staywise",
    "Cleverly",
    "Easewise",
    "Smoothly",
    "Hostwise",
    "Stayflow",
    "Everstay",
    "Staywell",
    "Staymint",
    "Nestwise",
    "Homewise",
    "Staybird",
    "Staybeam",
    "Staymate",
    "Staypilot",
    "Stayhero",
    "Staycraft",
    "Staymagic",
    "Hostmagic",
    "Hostpilot",
    "Hostmate",
    "Hosthero",
    "Hostwise",
    "Hostflow",
    "Hostbeam",
    "Hostmint",
]


# ============================================================
# STEP 3 - SETTINGS
# ============================================================

GODADDY_URL = (
    "https://api.godaddy.com/v3/domains/check-availability"
)

TARGET_PRICE = 9.79


# ============================================================
# STEP 4 - GODADDY API
# ============================================================

def check_domains(domains):
    """
    Check up to 25 domains at a time using GoDaddy.
    """

    if not GODADDY_PAT:
        raise RuntimeError(
            "GODADDY_PAT is not set. "
            "Paste your new GoDaddy PAT into the script."
        )

    headers = {
        "Authorization": f"Bearer {GODADDY_PAT}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    payload = {
        "domains": domains,
        "optimizeFor": "ACCURACY",
    }

    response = requests.post(
        GODADDY_URL,
        headers=headers,
        json=payload,
        timeout=30,
    )

    if response.status_code != 200:
        print("\nGoDaddy API ERROR")
        print("HTTP:", response.status_code)
        print(response.text)
        return []

    return response.json().get("items", [])


# ============================================================
# STEP 5 - NORMALIZE DOMAIN NAMES
# ============================================================

def make_domain(name):
    """Convert a candidate name into a .com domain."""

    name = name.strip().lower()

    if name.endswith(".com"):
        return name

    return name + ".com"


# ============================================================
# STEP 6 - RANKING
# ============================================================

def score_name(domain):
    """
    Simple branding score.

    This is NOT a trademark search.
    It is only a preliminary name-quality score.
    """

    name = domain.replace(".com", "")

    score = 0

    if len(name) <= 7:
        score += 3
    elif len(name) <= 9:
        score += 2
    elif len(name) <= 12:
        score += 1

    if not any(
        name.count(letter) >= 3
        for letter in set(name)
    ):
        score += 1

    vowels = sum(
        1 for c in name
        if c in "aeiou"
    )

    if vowels >= 2:
        score += 1

    return score


# ============================================================
# STEP 7 - CHECK A GROUP
# ============================================================

def check_group(title, names):

    print("\n" + "=" * 65)
    print(title)
    print("=" * 65)

    domains = [
        make_domain(name)
        for name in names
    ]

    # Remove duplicate domains.
    domains = list(dict.fromkeys(domains))

    results = []

    # GoDaddy allows a maximum of 25 domains per batch.
    for i in range(0, len(domains), 25):

        batch = domains[i:i + 25]

        print("\nChecking:")
        for domain in batch:
            print("   ", domain)

        batch_results = check_domains(batch)

        results.extend(batch_results)

    available = []

    print("\n" + "-" * 65)
    print(f"AVAILABLE DOMAINS AT EXACTLY ${TARGET_PRICE:.2f}")
    print("-" * 65)

    for result in results:

        domain = result.get("domain", "")
        is_available = result.get("available", False)

        if not is_available:
            continue

        prices = result.get("prices", [])

        if not prices:
            continue

        value = prices[0].get(
            "price", {}
        ).get("value")

        if value is None:
            continue

        price_value = value / 100

        # IMPORTANT:
        # Only show domains priced exactly at $9.79.
        if price_value != TARGET_PRICE:
            continue

        score = score_name(domain)
        price = f"${price_value:.2f}"

        available.append(
            (score, domain, price)
        )

    available.sort(
        reverse=True
    )

    if not available:
        print(
            f"No available domains found at exactly "
            f"${TARGET_PRICE:.2f}."
        )
    else:
        for score, domain, price in available:
            print(
                f"{domain:<30} "
                f"Score: {score}   "
                f"Price: {price}"
            )

    return available


# ============================================================
# STEP 8 - MAIN
# ============================================================

def run_main():

    print("\n")
    print("==============================================")
    print("       GODADDY .COM NAME FINDER")
    print("==============================================")
    print(
        f"FILTER: AVAILABLE .COM DOMAINS AT "
        f"EXACTLY ${TARGET_PRICE:.2f}"
    )

    hosting_results = check_group(
        "HOST / HOSTING / HOSTED NAMES",
        HOSTING_NAMES,
    )

    software_results = check_group(
        "SOFTWARE COMPANY NAMES",
        SOFTWARE_NAMES,
    )

    print("\n")
    print("==============================================")
    print("              FINAL SHORTLIST")
    print("==============================================")

    all_results = (
        hosting_results +
        software_results
    )

    all_results.sort(
        reverse=True
    )

    if not all_results:
        print(
            f"No available .com domains found at "
            f"exactly ${TARGET_PRICE:.2f}."
        )
    else:
        for score, domain, price in all_results:
            print(
                f"{domain:<30} "
                f"Score: {score}   "
                f"Price: {price}"
            )

    print("\nDone.")
    print(
        "Remember: availability and pricing can change, "
        "so verify immediately before registration."
    )


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    run_main()

