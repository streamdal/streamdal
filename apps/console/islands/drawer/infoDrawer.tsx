import { Audience } from "https://deno.land/x/streamdal_protos@v0.0.126/protos/sp_common.ts";
import { useEffect } from "preact/hooks";
import { initFlowBite } from "../../components/flowbite/init.tsx";
import { EmptyStateBird } from "../../components/icons/emptyStateBird.tsx";
import { opModal } from "../../components/serviceMap/opModalSignal.ts";
import { ServiceSignal } from "../../components/serviceMap/serviceSignal.ts";
import { Toast } from "../../components/toasts/toast.tsx";
import Component from "./component.tsx";
import Operation from "./operation.tsx";
import Service from "./service.tsx";

const EmptyDrawer = () => (
  <div class="h-full bg-white">
    <div class="min-h-screen bg-white">
      <div class="flex h-screen w-full flex-col items-center justify-center">
        <EmptyStateBird class="mb-2" />
        <h2 class="text-[#8E84AD]">No Items Selected</h2>
      </div>
    </div>
  </div>
);

export const DrawerContents = ({
  serviceMap,
  audience,
}: {
  serviceMap: ServiceSignal;
  audience: Audience;
}) => {
  switch (opModal.value?.displayType) {
    case "operation":
      return <Operation serviceMap={serviceMap} audience={audience} />;
    case "service":
      return <Service serviceMap={serviceMap} />;
    case "component":
      return <Component />;
    default:
      return null;
  }
};

export const InfoDrawer = ({
  serviceMap,
}: {
  serviceMap: ServiceSignal | null;
}) => {
  const audience = opModal.value?.audience;

  useEffect(() => {
    void initFlowBite();
  }, []);

  return (
    <>
      <Toast id="pipelineCrud" />
      <div
        className={`w-[308px] fixed top-0 right-0 z-50 h-screen overflow-y-scroll shadow-xl bg-white`}
      >
        {audience && opModal.value?.displayType && serviceMap
          ? <DrawerContents serviceMap={serviceMap} audience={audience} />
          : <EmptyDrawer />}
      </div>
    </>
  );
};
