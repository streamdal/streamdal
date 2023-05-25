import{r as f}from"./index.ed373d49.js";var i={exports:{}},n={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var _=f,a=Symbol.for("react.element"),d=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,x=_.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,y={key:!0,ref:!0,__self:!0,__source:!0};function c(t,e,l){var r,o={},s=null,p=null;l!==void 0&&(s=""+l),e.key!==void 0&&(s=""+e.key),e.ref!==void 0&&(p=e.ref);for(r in e)m.call(e,r)&&!y.hasOwnProperty(r)&&(o[r]=e[r]);if(t&&t.defaultProps)for(r in e=t.defaultProps,e)o[r]===void 0&&(o[r]=e[r]);return{$$typeof:a,type:t,key:s,ref:p,props:o,_owner:x.current}}n.Fragment=d;n.jsx=c;n.jsxs=c;i.exports=n;var u=i.exports;const R=()=>u.jsx("div",{className:"flex justify-center bg-purple-light border-purple-accent w-40 border rounded",onClick:async()=>{const t=await fetch("/v1/ruleset");console.info("rules",t)},children:u.jsx("h1",{className:"my-2 cursor-pointer",children:"Get Rules"})});export{R as Rule};
