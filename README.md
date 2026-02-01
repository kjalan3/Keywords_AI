## Recovery-Based Workout Recommender — Intro

**Recovery-Based Workout Recommender** is an intelligent system that analyzes wearable recovery signals and recent trends to help users train more effectively — not just harder.

Using HRV and sleep data (from Apple Watch–style wearables), the system first learns what *normal recovery looks like for each individual*. Instead of relying on population averages, it builds a **personal baseline** from the user’s own historical data.

Each day, the app evaluates:

* today’s HRV relative to the user’s baseline,
* recent HRV trends (rising or declining),
* and sleep duration,

and classifies recovery into **HIGH, MODERATE, or LOW** using transparent, rule-based logic.

Rather than giving generic advice, the output explains *why* a given recovery state was assigned — for example, identifying sustained HRV decline over several days or insufficient sleep as limiting factors.

This recovery engine serves as the foundation for personalized workout adjustments, enabling future features like AI coach explanations and recovery-aware training recommendations.

