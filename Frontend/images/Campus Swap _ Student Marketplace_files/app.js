// =====================================
// 1. CAMPUS SWAP - GENERAL JAVASCRIPT
// =====================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("Campus Swap website loaded successfully!");

    // =====================================
    // 2. HIGHLIGHT THE CURRENT NAVIGATION
    // =====================================

    const navLinks = document.querySelectorAll("header nav a");

    const currentPage = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    navLinks.forEach(function (link) {

        const linkPage = link.getAttribute("href");

        if (
            linkPage &&
            !linkPage.startsWith("#") &&
            linkPage.toLowerCase() === currentPage
        ) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }

    });


    // =====================================
    // 3. UPDATE COPYRIGHT YEAR
    // =====================================

    const copyright = document.querySelector(".copyright");

    if (copyright) {
        copyright.textContent =
            `© ${new Date().getFullYear()} Campus Swap. All rights reserved.`;
    }


    // =====================================
    // 4. HANDLE EMPTY LINKS
    // =====================================

    const links = document.querySelectorAll('a[href="#"]');

    links.forEach(function (link) {

        link.addEventListener("click", function (event) {
            event.preventDefault();
        });

    });


    // =====================================
    // 5. BACK TO TOP FUNCTIONALITY
    // =====================================

    const backToTop = document.getElementById("back-to-top");

    if (backToTop) {

        backToTop.addEventListener("click", function () {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

    }

});