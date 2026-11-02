/** Shown for the moment a page's code is being fetched (route-level code splitting). */
const RouteLoading = () => (
  <div className="flex h-full min-h-[50vh] w-full items-center justify-center" aria-busy="true">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent opacity-40" />
  </div>
);

export default RouteLoading;
