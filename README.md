# Jhomar Baluca — Portfolio

Open http://localhost/me/portfolio/ with Apache running in XAMPP, or open index.html directly in a browser. No build step or dependencies are required.

Content is based on the supplied resume. The project illustrations are conceptual; replace them with approved screenshots when available. Project buttons open details rather than unverified external links.

The contact form opens a mailto draft. It does not send or store messages on a server. The resume download includes the personal contact details in the supplied PDF.

Edit index.html for biography and experience, index.js for skills, project notes, and scroll interactions. style.css supplies the base components; design.css supplies the editorial layout and effects; quest.css styles the exploration preview and detailed web stack; flight.css styles Plane Mode.

The hero contains an inline exploration game, with direct links to real portfolio sections. It is not a connected AI chat. Scroll effects use native scrolling and IntersectionObserver, and respect the system’s reduced-motion preference. Content remains visible without JavaScript. The Skills section includes detailed frontend, application, database, and cloud/workflow stack information based on the resume.

companion.js manages JB, the scroll companion, with section-specific messages, pause and hide controls, and reduced-motion support. companion-3d.js upgrades JB to a procedural Three.js robot with cursor tracking, scroll reactions, a contact-section wave, and a click greeting. Click the robot to say hello; use its separate pause control to stop motion. The paper texture is a local SVG asset.

Three.js 0.180.0 is vendored with its MIT license in assets/vendor/three. No installation or build is needed. Use XAMPP or another HTTP server for the 3D ES modules. The SVG remains available if WebGL 2 or module loading fails. Visitors who initially request reduced motion get the static SVG; toggling reduced motion or pause stops the 3D animation. Rendering is capped at 30 fps and 1.5x display resolution, pauses in background tabs, and disposes GPU resources when JB is hidden.

interactions.js adds a cursor halo, click ripples, gentle card tilt, and illustration bounce for mouse users. It preserves the native cursor, avoids form fields and dialogs, and disables these effects on touch devices or when reduced motion is requested.

scroll-outlines.js adds an orange SVG stroke that travels around cards and project illustration frames with page scrolling. ResizeObserver keeps each outline fitted to its frame, and offscreen outlines skip updates. With reduced motion enabled, the accent stays still.

The hero offers “Enter Plane Mode”: an optional full-viewport sky with a paper airplane, drifting clouds, and five information gates. Arrow keys/WASD or the touch controls steer horizontally and vertically while forward flight is automatic. Passing through a gate pauses flight and shows resume-based information; “Continue flying” resumes. Missed gates recycle. Pause, restart, Exit Plane Mode, and Escape are supported. Topic buttons provide the same information without steering.

quest.js handles the preview, flight UI, discoveries, keyboard/touch controls, and lifecycle. flight-physics.mjs contains bounded movement and collision detection; flight-world.js lazy-loads the local Three.js renderer. flight.css styles the sky and HUD. Closing Plane Mode disposes GPU resources and restores focus and page scrolling. Flight pauses when the tab loses focus; reduced motion stops automatic flight. If WebGL or module loading is unavailable, all five discoveries remain available through topic buttons. No visitor data or progress is persisted. Run the collision/movement checks with `node --test tests/flight-physics.test.mjs`.
# jhomarbaluca
