import { opModal } from "../../components/serviceMap/opModalSignal.ts";
import { ServiceLanguage } from "../../components/icons/serviceLanguages.tsx";
import { ServiceSignal } from "../../components/serviceMap/serviceSignal.ts";

export default function Service(
  { serviceMap }: { serviceMap: ServiceSignal },
) {
  const liveServiceInfo = serviceMap.live.find((service) =>
    service.client?.ServiceName === opModal.value?.audience.serviceName
  );
  const serviceLanguage = liveServiceInfo?.client?.language;

  return (
    <>
      <div class="z-[20] flex items-center justify-start px-4 w-full h-16 bg-web">
        <div
          className={"rounded-full w-[40px] h-[40px] bg-purple-200 flex justify-center items-center p-1"}
        >
          <div className={"w-[25px] flex justify-center items-center"}>
            <ServiceLanguage language={serviceLanguage} />
          </div>
        </div>
        <div class="flex flex-col">
          <h3 class="text-lg text-cloud mx-2">
            {opModal.value.audience.serviceName}
          </h3>
        </div>
      </div>
      <div class="bg-white min-h-screen">
        <h3 id="collapse-heading-10">
          <button
            type="button"
            className="flex items-center border-b border-purple-100 w-full py-3 font-medium text-left text-gray-500 focus:ring-2"
            data-accordion-target="#collapse-body-3"
            aria-expanded="true"
            aria-controls="collapse-body-10"
          >
            <h3 class="text-web text-sm font-semibold ml-10">
              Metrics
            </h3>
          </button>
        </h3>
        <div
          id="collapse-body-10"
          aria-labelledby="collapse-heading-10"
        >
          <div class="p-5">
            <p class="text-gray-300 text-xs">
              Metrics coming soon...
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
