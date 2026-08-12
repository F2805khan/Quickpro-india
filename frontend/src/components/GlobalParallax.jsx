import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "gsap/all";
import { useGSAP } from "@gsap/react";
import { useLocation } from "react-router-dom";

// This component acts as a lightweight replacement for ScrollSmoother's data-speed parallax.
// It finds all elements with a [data-speed] attribute and animates their y-position
// based on scroll offset to create a parallax effect.
export default function GlobalParallax() {
  const location = useLocation();

  useGSAP(() => {
    // 1. Refresh ScrollTrigger every time the route changes so it finds new elements
    ScrollTrigger.refresh();

    // 2. Select all elements that have a data-speed attribute
    const elements = gsap.utils.toArray("[data-speed]");

    // 3. Apply parallax to each element
    elements.forEach((el) => {
      // e.g. 0.8 is slower, 1.2 is faster
      const speed = parseFloat(el.getAttribute("data-speed"));
      
      if (isNaN(speed)) return;
      
      // Calculate a realistic parallax offset intensity
      const yOffset = (1 - speed) * 150; 

      gsap.fromTo(el,
        { 
          y: -yOffset 
        },
        {
          y: yOffset,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            // Start the animation when the element's top enters the bottom of the viewport
            start: "top bottom",
            // End when the element's bottom leaves the top of the viewport
            end: "bottom top",
            scrub: true,
            // Only recalculate on refresh
            invalidateOnRefresh: true,
          }
        }
      );
    });

    // Cleanup when component unmounts or runs again
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [location.pathname]); // Re-run effect whenever we navigate to a new page

  return null;
}
