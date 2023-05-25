import{r as i}from"./index.ed373d49.js";var f={exports:{}},n={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var _=i,a=Symbol.for("react.element"),c=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,y=_.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,x={key:!0,ref:!0,__self:!0,__source:!0};function p(t,e,l){var r,o={},s=null,u=null;l!==void 0&&(s=""+l),e.key!==void 0&&(s=""+e.key),e.ref!==void 0&&(u=e.ref);for(r in e)m.call(e,r)&&!x.hasOwnProperty(r)&&(o[r]=e[r]);if(t&&t.defaultProps)for(r in e=t.defaultProps,e)o[r]===void 0&&(o[r]=e[r]);return{$$typeof:a,type:t,key:s,ref:u,props:o,_owner:y.current}}n.Fragment=c;n.jsx=p;n.jsxs=p;f.exports=n;var v=f.exports;const d=()=>v.jsx("input",{type:"button",className:"flex justify-center btn-heimdal",onClick:async()=>{const t=await fetch("/v1/ruleset");console.info("rules",t)},value:"Get Rules"});export{d as Rule};
