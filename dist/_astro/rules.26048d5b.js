import{r as i}from"./index.ed373d49.js";var l={exports:{}},n={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var c=i,_=Symbol.for("react.element"),a=Symbol.for("react.fragment"),y=Object.prototype.hasOwnProperty,m=c.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,x={key:!0,ref:!0,__self:!0,__source:!0};function f(t,e,p){var r,o={},s=null,u=null;p!==void 0&&(s=""+p),e.key!==void 0&&(s=""+e.key),e.ref!==void 0&&(u=e.ref);for(r in e)y.call(e,r)&&!x.hasOwnProperty(r)&&(o[r]=e[r]);if(t&&t.defaultProps)for(r in e=t.defaultProps,e)o[r]===void 0&&(o[r]=e[r]);return{$$typeof:_,type:t,key:s,ref:u,props:o,_owner:m.current}}n.Fragment=a;n.jsx=f;n.jsxs=f;l.exports=n;var d=l.exports;const R=()=>d.jsx("input",{type:"button",className:"flex justify-center bg-purple-light border-purple-accent w-40 border rounded py-2 cursor-pointer",onClick:async()=>{const t=await fetch("/v1/ruleset");console.info("rules",t)},value:"Get Rules"});export{R as Rule};
