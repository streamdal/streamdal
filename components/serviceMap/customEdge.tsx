import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from "reactflow";
import { edgeKey } from "../../lib/utils.ts";
import { edgeMetricsSignal } from "../../lib/edgeMetrics.ts";
import { OperationType } from "snitch-protos/protos/sp_common.ts";

function EdgeLabel(
  { transform, bytes, processed }: {
    transform: string;
    bytes: string;
    processed: string;
  },
) {
  return (
    <div
      style={{
        transform,
      }}
      className="absolute flex flex-col bg-white p-2 font-medium text-sm rounded-md shadow-md nodrag nopan"
    >
      <div class="flex flex-row justify-start items-center">
        <div class="text-cobweb mr-[2px]">Bytes/s:</div>
        <div class="text-web">{bytes}</div>
      </div>
      <div className="flex flex-row justify-start items-center">
        <div className="text-cobweb mr-[2px]">Processed/s:</div>
        <div className="text-web">{processed}</div>
      </div>
    </div>
  );
}

export const ServiceEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerStart,
  markerEnd,
}: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    markerStart,
    markerEnd,
  });

  const x = data?.a.operationType === OperationType.CONSUMER
    ? sourceX
    : targetX;
  const y = data?.a.operationType === OperationType.CONSUMER
    ? sourceY
    : targetY;

  const key = edgeKey(data?.a);
  const metrics = edgeMetricsSignal.value &&
      edgeMetricsSignal.value[key]
    ? edgeMetricsSignal.value[key]
    : { bytes: "0", processed: "0" };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerStart={markerStart}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <EdgeLabel
          transform={`translate(-50%, -150%) translate(${x}px,${y}px)`}
          bytes={metrics.bytes}
          processed={metrics.processed}
        />
      </EdgeLabelRenderer>
    </>
  );
};

export const ComponentEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerStart,
  markerEnd,
  data,
}: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    markerStart,
    markerEnd,
  });

  const x = data?.a.operationType === OperationType.PRODUCER
    ? sourceX
    : targetX;
  const y = data?.a.operationType === OperationType.PRODUCER
    ? sourceY
    : targetY;

  const key = edgeKey(data?.a);
  const metrics = edgeMetricsSignal.value &&
      edgeMetricsSignal.value[key]
    ? edgeMetricsSignal.value[key]
    : { bytes: "0", processed: "0" };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerStart={markerStart}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <EdgeLabel
          transform={`translate(-50%, 50%) translate(${x}px,${y}px)`}
          bytes={metrics.bytes}
          processed={metrics.processed}
        />
      </EdgeLabelRenderer>
    </>
  );
};
