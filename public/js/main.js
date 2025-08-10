async function loadModule(moduleName) {
    const htmlPath = `js/modules/${moduleName}/${moduleName.split('-').join(' ')}.html`.replace(/ /g, '-');
    const htmlUrl = `js/modules/${moduleName}/${moduleName}.html`;
    const cssUrl = `js/modules/${moduleName}/${moduleName}.css`;
    const jsUrl = `js/modules/${moduleName}/${moduleName}.js`;

    // Load HTML
    const htmlContent = await fetch(htmlUrl).then(res => res.text());
    document.getElementById('app-content').innerHTML = htmlContent;

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssUrl;
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.src = jsUrl;
    document.body.appendChild(script);
}
