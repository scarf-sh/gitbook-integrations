import {
    createIntegration,
    ExposableError,
    FetchPublishScriptEventCallback,
    RuntimeContext,
    RuntimeEnvironment,
} from '@gitbook/runtime';

type ScarfRuntimeContext = RuntimeContext<RuntimeEnvironment<{},{ pixel_id: string }>>;

export const handleFetchEvent: FetchPublishScriptEventCallback = async (
    event,
  { environment }: ScarfRuntimeContext,
) => {
    const pixelId = environment.siteInstallation?.configuration?.pixel_id;

    if (!pixelId ) {
        throw new ExposableError(`The Scarf pixel id is missing from your configuration.`);
    }

  return new Response(
    `
    <script>
      // Function to send tracking request with current URL as referrer
      function trackScarfPixel() {
        const pixelUrl = "https://static.scarf.sh/a.png?x-pxid=${pixelId}";
        // Simple GET request using fetch API
        fetch(pixelUrl, {
          method: 'GET',
          referrerPolicy: 'no-referrer-when-downgrade',
          // We don't need to handle the response
          cache: 'no-store'
        }).catch(e => {
          // Silently handle any errors to avoid breaking the page
          console.debug('Scarf tracking error:', e);
        });
      }

      // Track on initial page load
      trackScarfPixel();

      // Set up listener for route changes
      if (typeof window !== 'undefined') {
        // Override pushState method to track navigation changes
        const pushState = history.pushState;
        history.pushState = function() {
          pushState.apply(this, arguments);
          trackScarfPixel();
        };
        
        // Override replaceState method as well, which is also used for navigation
        const replaceState = history.replaceState;
        history.replaceState = function() {
          replaceState.apply(this, arguments);
          trackScarfPixel();
        };
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', function() {
          trackScarfPixel();
        });

        // Fallback for hash-based routing
        window.addEventListener('hashchange', function() {
          trackScarfPixel();
        });
      }
    </script>
    `,
    {
        headers: {
            'Content-Type': 'text/html',
        },
    });
};

export default createIntegration<ScarfRuntimeContext>({
    fetch_published_script: handleFetchEvent,
});
