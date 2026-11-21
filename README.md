# Jhomar Baluca — Portfolio

Open http://localhost/me/portfolio/ with Apache running in XAMPP, or open index.html directly in a browser. No build step or dependencies are required.

Content is based on the supplied resume. The project illustrations are conceptual; replace them with approved screenshots when available. Project buttons open details rather than unverified external links.

The contact form opens a mailto draft. It does not send or store messages on a server. The resume download includes the personal contact details in the supplied PDF.

Edit index.html for biography and experience, index.js for skills, project notes, and scroll interactions. style.css supplies the base components; design.css supplies the editorial layout, workspace preview, and responsive overrides.

The workspace preview links to real portfolio sections. It is not a connected AI chat. Scroll effects use native scrolling and IntersectionObserver, and respect the system’s reduced-motion preference. Content remains visible without JavaScript.

companion.js manages JB, the scroll companion, with section-specific messages, pause and hide controls, and reduced-motion support. companion-3d.js upgrades JB to a procedural Three.js robot with cursor tracking, scroll reactions, a contact-section wave, and a click greeting. Click the robot to say hello; use its separate pause control to stop motion. The paper texture is a local SVG asset.

Three.js 0.180.0 is vendored with its MIT license in assets/vendor/three. No installation or build is needed. Use XAMPP or another HTTP server for the 3D ES modules. The SVG remains available if WebGL 2 or module loading fails. Visitors who initially request reduced motion get the static SVG; toggling reduced motion or pause stops the 3D animation. Rendering is capped at 30 fps and 1.5x display resolution, pauses in background tabs, and disposes GPU resources when JB is hidden.

interactions.js adds a cursor halo, click ripples, gentle card tilt, and illustration bounce for mouse users. It preserves the native cursor, avoids form fields and dialogs, and disables these effects on touch devices or when reduced motion is requested.
# jhomarbaluca
