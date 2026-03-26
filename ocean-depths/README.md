# Ocean Depths — Into the Abyss

## Project Description (for submission)

**Concept:** *Into the Abyss* is an immersive vertical scrolling experience that takes the user on a descent through the five primary zones of the ocean — from the sunlit surface to the crushing darkness of the Hadal Zone at nearly 11,000 meters deep.

**Design Process:** The site was designed with a single guiding principle: *depth as narrative*. As users scroll, the visual language shifts organically — colors transition from vibrant tropical blues at the surface to near-total blackness in the Mariana Trench. Typography uses Cormorant Garamond for its elegant, editorial quality, paired with Syne for crisp UI elements. Every detail — particle density, bioluminescent dot counts, background gradients — was calibrated to reinforce the sensation of sinking deeper.

**Technical Approach:** The experience is built in vanilla HTML, CSS, and JavaScript — no frameworks, no build tools — keeping it lean and fast. A custom Intersection Observer drives zone-reveal animations. Scroll-driven parallax affects background layers and floating creatures independently, creating layered depth. A real-time depth and pressure indicator in the navigation bar reacts continuously to scroll position, interpolating between zone data. Bioluminescent particles are procedurally generated and animated via CSS keyframes for performance. Interactive fact cards respond to hover and click with ripple effects.

**Storytelling Arc:** Each zone is a chapter — Surface (wonder), Sunlight (abundance), Twilight (mystery), Midnight (darkness), Abyss (awe and humility). The journey ends with a Cousteau quote and an invitation to ascend, leaving the user with a sense of the ocean's immensity and our limited knowledge of it.