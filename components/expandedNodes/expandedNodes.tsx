import {Consumer, Producer} from "../customNodes.tsx";

export const ExpandedNodes = ({nodes, params}) => {
    const actorType = params.operationType === "consumer" ? 1 : 2
    const filteredNodes = nodes.filter(item => item.audience.operationType === actorType).map(actor => {
        return {label: actor.audience.operationName, pipeline: actor, flow: false}
    })
    console.log(filteredNodes)
    const expandedNodes = filteredNodes.map(item => {
        return actorType === "consumer" ? <Consumer data={...item}/> : <Producer data={...item}/>
    })

    return (
        <div class={"w-screen h-screen absolute top-0 bottom-0 scroll-none inset-0 flex justify-center items-center"}>
            <div class={"z-50 bg-gray-900 opacity-30 absolute w-full h-full"}></div>
            <div class={"grid grid-cols-2 w-fit gap-4 z-50 absolute"}>
                {expandedNodes}
            </div>
        </div>
    )
}