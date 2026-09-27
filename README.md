<section class="project-description">
  <h1>Background Changer</h1>

  <p>
    <strong>Background Changer</strong> is a modern wallpaper application that
    allows users to browse and download high-quality preset backgrounds. Select
    your preferred background, download it, and use it as your device wallpaper.
    An optional installer is also planned to make the wallpaper setup process
    faster and more convenient.
  </p>

  <p>
    Each selected background can be processed and converted to
    <strong>4K resolution</strong> using the
    <em>Sharp image-processing library</em>. This helps produce sharper,
    higher-quality images that look great on desktops, laptops, and large
    displays.
  </p>

  <h2>Features</h2>

  <ul>
    <li>
      <strong>Preset backgrounds:</strong>
      Choose from a collection of ready-to-use wallpapers.
    </li>
    <li>
      <strong>4K conversion:</strong>
      Optimize and convert images to 4K resolution using Sharp.
    </li>
    <li>
      <strong>Easy downloads:</strong>
      Download your selected background with one click.
    </li>
    <li>
      <strong>Wallpaper setup:</strong>
      Use downloaded images as your device background. An installer-based setup
      method is planned for a future release.
    </li>
    <li>
      <strong>Responsive design:</strong>
      Use the website across desktop and mobile devices.
    </li>
    <li>
      <strong>Upcoming content:</strong>
      More backgrounds and dynamically loaded website data are coming soon.
    </li>
  </ul>

  <h2>Installation Requirements</h2>

  <p>
    To run and build the website locally, you need
    <strong>Node.js</strong>. Node.js includes <strong>npm</strong>, which is
    used to install project dependencies and run development and build commands.
  </p>

  <p>
    If you plan to use animated wallpapers, install
    <strong>Lively Wallpaper</strong> before adding or running an animated
    background. Lively Wallpaper is recommended for animated backgrounds, but
    it can place significant strain on your GPU. Only use moving wallpapers on
    devices capable of handling the additional graphics workload.
  </p>

  <p>
    The <strong>BG App Code</strong> folder contains the website's source code.
    It is intended for users who want to modify the application or run it
    offline. Running the source code locally may not provide all features
    available in the complete website or installer.
  </p>

  <ol>
    <li>Download and install Node.js from the official Node.js website.</li>
    <li>Open a terminal inside the project folder.</li>
    <li>Install the project dependencies.</li>
    <li>Install the Sharp image-processing library.</li>
  </ol>

  <pre><code>npm install
npm install sharp</code></pre>

  <h2>Building the Website</h2>

  <p>
    After installing Node.js, npm, and Sharp, create a production build of the
    website by running:
  </p>

  <pre><code>npm run build</code></pre>

  <p>
    The build command compiles and optimizes the project files for deployment.
    The completed website can then be hosted on a web server or connected to an
    installer method in a future release.
  </p>

  <h2>Desktop Installer</h2>

  <p>
    A desktop installer is planned for users who prefer a simpler installation
    process. After running the production build, open the
    <code>/dist</code> folder and run:
  </p>

  <pre><code>Background Maker Setup 1.0.0.exe</code></pre>

  <p>
    The installer will allow the application to be added to your device's home
    screen. A downloadable installer containing the available backgrounds is
    also planned.
  </p>

  <p>
    If you do not need the source code, you can remove the
    <strong>BG App Code</strong> folder. It is primarily intended for developers
    and users who want to modify or run the website locally.
  </p>

  <h2>Animated Backgrounds</h2>

  <p>
    It is recommended that you install
    <strong>Lively Wallpaper</strong> before running the application with:
  </p>

  <pre><code>npm start</code></pre>

  <p>
    Installing Lively Wallpaper first may provide a smoother experience when
    using animated backgrounds. Because animated wallpapers can use significant
    GPU resources, they should only be enabled on devices that can handle the
    additional workload. It is recommended that you also <strong>run</strong> Lively Wallpaper <em>before</em> you install an animated background.
  </p>

  <h2>Command-Line Controls</h2>

  <p>
    Use <code>/help</code> to view all available commands. Use
    <code>/search</code> to filter backgrounds by keywords or descriptions. For
    example, <code>/search ice</code> searches for images related to ice.
    To reset the search filter, use <code>/search</code> without a search term.
  </p>

  <h3>Available Commands</h3>

  <pre><code>/help
/get [asset-id]
/add [asset-id]
/download
/clear
/search [term]</code></pre>

  <h2>Project Status</h2>

  <p>
    <strong>Background Changer is currently in development.</strong>
    Core wallpaper selection, downloading, and 4K image-processing features are
    being prepared. Additional preset backgrounds and automatically loaded
    website data are coming soon.
  </p>
</section>
