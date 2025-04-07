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
    `<img class="hidden" referrerpolicy="no-referrer-when-downgrade" src="https://static.scarf.sh/a.png?x-pxid=${pixelId}">`,
    {
        headers: {
            'Content-Type': 'text/html',
        },
    });
};

export default createIntegration<ScarfRuntimeContext>({
    fetch_published_script: handleFetchEvent,
});
