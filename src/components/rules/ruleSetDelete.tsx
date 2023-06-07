import React, { useEffect, useState } from "react";
import { Loading } from "../icons/nav";
import { getJson } from "../../lib/fetch";
import { Error } from "../errors/error";
import { Delete } from "../icons/crud";
import { mutate } from "../../lib/mutation";

const RULESET_ERROR = "Ruleset not found!";
const RULESET_DELETE_ERROR = "There was a problem deleting the ruleset!";

export const RuleSetDelete = () => {
  const [ruleSet, setRuleSet] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const params = new URLSearchParams(document.location.search);
  const id = params.get("id");
  const confirm = params.get("confirm");

  const getData = async () => {
    try {
      setRuleSet(await getJson(`/v1/ruleset/${id}`));
    } catch {
      setError(RULESET_ERROR);
    }
    setLoading(false);
  };

  const deleteRuleset = async () => {
    try {
      await mutate({ method: "DELETE", apiPath: `/v1/ruleset/${id}` });
      window.location.href = "/";
    } catch {
      setError(RULESET_DELETE_ERROR);
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);

    if (!id) {
      setLoading(false);
      setError("Ruleset ID param is required");
      return;
    }

    if (confirm === "yes") {
      deleteRuleset();
      return;
    }
    getData();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error error={error} />;
  }

  return (
    <div
      className="relative z-10"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <Delete fill="#FF7D68" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3
                    className="text-base font-semibold leading-6 text-gray-900"
                    id="modal-title"
                  >
                    Delete Ruleset
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete ruleset{" "}
                      <span className="font-bold">{ruleSet?.name}</span>?
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <a href={`/ruleset/delete/?id=${id}&confirm=yes`}>
                <button type="button" className="ml-2 btn-delete">
                  Delete
                </button>
              </a>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
