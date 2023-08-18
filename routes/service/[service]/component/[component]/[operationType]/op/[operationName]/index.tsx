import OpModal from "../../../../../../../../islands/opModal.tsx";
import { PageProps } from "$fresh/src/server/types.ts";
import { SuccessRoute } from "../../../../../../../_middleware.ts";
import { serviceSignal } from "../../../../../../../../islands/serviceMap.tsx";

export default function FlowRoute(
  props: PageProps<
    SuccessRoute
  >,
) {
  return (
    <OpModal
      modalOpen={true}
      params={props.params as any}
      serviceMap={serviceSignal.value}
      success={props.data.success}
    />
  );
}
