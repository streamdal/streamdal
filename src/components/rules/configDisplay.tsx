const DisplayValue = ({ config }: { config: any }) => (
  <div>
    <span className="bg-sunset p-1 my-2">{config}</span>
  </div>
);

const DisplayObject = ({ config }: { config: any }) => (
  <div className="flex flex-col w-full ml-2 mb-4">
    {Array.isArray(config)
      ? config.map((c, i) => (
          <DisplayConfig config={c} key={`rule-config-key-${i}`} />
        ))
      : Object.keys(config).map((k, i) => (
          <div
            key={`config-entry-key-${i}`}
            className={`flex ${
              typeof config[k] === "object" ? "flex-col" : "flex-row"
            } `}
          >
            <div
              className={`text-stormCloud text-xs-[14px] mb-2 mr-2 ${
                typeof config[k] === "object" ? "font-bold" : "font-semibold"
              }`}
            >
              {k}:
            </div>
            <DisplayConfig config={config[k]} />
          </div>
        ))}
  </div>
);

export const DisplayConfig = ({ config }: { config: any }) =>
  typeof config === "object" ? (
    <DisplayObject config={config} />
  ) : (
    <DisplayValue config={config} />
  );
