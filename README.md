# Jhomar Baluca — Portfolio

Open http://localhost/me/portfolio/ with Apache running in XAMPP, or open index.html directly in a browser. No build step or dependencies are required.

Content is based on the supplied resume. The project illustrations are conceptual; replace them with approved screenshots when available. Project buttons open details rather than unverified external links.

The contact form opens a mailto draft. It does not send or store messages on a server. The resume download includes the personal contact details in the supplied PDF.

Edit index.html for biography and experience, index.js for skills, project notes, and scroll interactions. style.css supplies the base components; design.css supplies the editorial layout and effects; quest.css styles the inline game and detailed web stack.

The hero contains an inline exploration game, with direct links to real portfolio sections. It is not a connected AI chat. Scroll effects use native scrolling and IntersectionObserver, and respect the system’s reduced-motion preference. Content remains visible without JavaScript. The Skills section includes detailed frontend, application, database, and cloud/workflow stack information based on the resume.

companion.js manages JB, the scroll companion, with section-specific messages, pause and hide controls, and reduced-motion support. companion-3d.js upgrades JB to a procedural Three.js robot with cursor tracking, scroll reactions, a contact-section wave, and a click greeting. Click the robot to say hello; use its separate pause control to stop motion. The paper texture is a local SVG asset.

Three.js 0.180.0 is vendored with its MIT license in assets/vendor/three. No installation or build is needed. Use XAMPP or another HTTP server for the 3D ES modules. The SVG remains available if WebGL 2 or module loading fails. Visitors who initially request reduced motion get the static SVG; toggling reduced motion or pause stops the 3D animation. Rendering is capped at 30 fps and 1.5x display resolution, pauses in background tabs, and disposes GPU resources when JB is hidden.

interactions.js adds a cursor halo, click ripples, gentle card tilt, and illustration bounce for mouse users. It preserves the native cursor, avoids form fields and dialogs, and disables these effects on touch devices or when reduced motion is requested.

scroll-outlines.js adds an orange SVG stroke that travels around cards and project illustration frames with page scrolling. ResizeObserver keeps each outline fitted to its frame, and offscreen outlines skip updates. With reduced motion enabled, the accent stays still.

Explore the game directly in the hero, or use the “Explore” navigation link. quest.js handles movement, five resume-based discoveries, touch controls, pause/restart, and an accessible topic list. quest-world.js loads when the island enters view. Keyboard controls only handle movement while the island or its movement buttons have focus; the rest of the page scrolls normally. Rendering pauses offscreen, in background tabs, and while a project dialog is open. The floating companion pauses while the island is active. Visitors can explore every discovery with the topic buttons; a simple map remains available if WebGL fails. Reduced motion uses quiet mode with the topic list. No score, visitor data, or progress is stored.
# jhomarbaluca
