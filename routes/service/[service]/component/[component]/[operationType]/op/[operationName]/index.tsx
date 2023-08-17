import { Layout } from "../../../../../../../../components/layout.tsx";
import OpModal from "../../../../../../../../islands/opModal.tsx";
import { Handlers, PageProps } from "$fresh/src/server/types.ts";
import {
  getServiceMap,
  getServiceNodes,
  ServiceMapType,
  ServiceNodes,
} from "../../../../../../../../lib/fetch.ts";
import { SuccessRoute, SuccessType } from "../../../../../../../_middleware.ts";
import ServiceMap, {
  serviceSignal,
} from "../../../../../../../../islands/serviceMap.tsx";

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
