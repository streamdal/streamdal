import OpModal from "../islands/opModal.tsx";
import { serviceSignal } from "../islands/serviceMap.tsx";

export default function IndexRoute() {
  return (
    <OpModal
      serviceMap={serviceSignal.value}
    />
  );
}
