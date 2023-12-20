import IconBrandPython from "tabler-icons/tsx/brand-python.tsx";
import IconQuestionMark from "tabler-icons/tsx/question-mark.tsx";

export const ServiceLanguage = ({ language }: { language?: string }) => {
  switch (language?.toLowerCase()) {
    case "typescript":
      return (
        <svg
          fill="#000000"
          viewBox="0 0 24 24"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          className={"max-w-[30px]"}
        >
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
          </g>
          <g id="SVGRepo_iconCarrier">
            <path d="M0 12v12h24V0H0zm19.341-.956c.61.152 1.074.423 1.501.865.221.236.549.666.575.77.008.03-1.036.73-1.668 1.123-.023.015-.115-.084-.217-.236-.31-.45-.633-.644-1.128-.678-.728-.05-1.196.331-1.192.967a.88.88 0 0 0 .102.45c.16.331.458.53 1.39.933 1.719.74 2.454 1.227 2.911 1.92.51.773.625 2.008.278 2.926-.38.998-1.325 1.676-2.655 1.9-.411.073-1.386.062-1.828-.018-.964-.172-1.878-.648-2.442-1.273-.221-.243-.652-.88-.625-.925.011-.016.11-.077.22-.141.108-.061.511-.294.892-.515l.69-.4.145.214c.202.308.643.731.91.872.766.404 1.817.347 2.335-.118a.883.883 0 0 0 .313-.72c0-.278-.035-.4-.18-.61-.186-.266-.567-.49-1.649-.96-1.238-.533-1.771-.864-2.259-1.39a3.165 3.165 0 0 1-.659-1.2c-.091-.339-.114-1.189-.042-1.531.255-1.197 1.158-2.03 2.461-2.278.423-.08 1.406-.05 1.821.053zm-5.634 1.002l.008.983H10.59v8.876H8.38v-8.876H5.258v-.964c0-.534.011-.98.026-.99.012-.016 1.913-.024 4.217-.02l4.195.012z">
            </path>
          </g>
        </svg>
      );
    case "go":
      return (
        <svg
          viewBox="0 0 34 13"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={"max-w-[45px]"}
        >
          <g clip-path="url(#clip0_2296_1186)">
            <path
              d="M2.56623 3.84165C2.5 3.84165 2.48344 3.80853 2.51656 3.75886L2.86428 3.31179C2.89739 3.26212 2.98018 3.229 3.04641 3.229H8.95763C9.02386 3.229 9.04042 3.27868 9.0073 3.32835L8.72581 3.75886C8.6927 3.80853 8.60991 3.85821 8.56023 3.85821L2.56623 3.84165Z"
              fill="#28203F"
            />
            <path
              d="M0.0657438 5.36509C-0.000488281 5.36509 -0.0170463 5.33197 0.0160697 5.2823L0.363788 4.83523C0.396904 4.78556 0.479694 4.75244 0.545926 4.75244H8.09638C8.16261 4.75244 8.19573 4.80212 8.17917 4.85179L8.04671 5.24918C8.03015 5.31541 7.96392 5.34853 7.89769 5.34853L0.0657438 5.36509Z"
              fill="#28203F"
            />
            <path
              d="M4.07307 6.88852C4.00684 6.88852 3.99028 6.83885 4.02339 6.78918L4.25521 6.37523C4.28832 6.32555 4.35455 6.27588 4.42079 6.27588H7.73239C7.79862 6.27588 7.83174 6.32555 7.83174 6.39178L7.79862 6.78918C7.79862 6.85541 7.73239 6.90508 7.68272 6.90508L4.07307 6.88852Z"
              fill="#28203F"
            />
            <path
              d="M21.2603 3.54373C20.2171 3.80866 19.5051 4.00735 18.4785 4.27228C18.2302 4.33851 18.2136 4.35507 17.9983 4.1067C17.75 3.82521 17.5678 3.64308 17.2201 3.4775C16.177 2.9642 15.1669 3.11322 14.2231 3.72587C13.0972 4.45442 12.5176 5.53069 12.5342 6.87189C12.5508 8.19653 13.4614 9.28936 14.7695 9.4715C15.8955 9.62052 16.8393 9.22313 17.5844 8.37867C17.7334 8.19653 17.8659 7.99783 18.0315 7.76602C17.4354 7.76602 16.6903 7.76602 14.8358 7.76602C14.488 7.76602 14.4053 7.55077 14.5212 7.26928C14.7364 6.75598 15.1338 5.89497 15.3656 5.46446C15.4153 5.36511 15.5312 5.19953 15.7796 5.19953C16.624 5.19953 19.7369 5.19953 21.8067 5.19953C21.7736 5.6466 21.7736 6.09366 21.7073 6.54073C21.5252 7.73291 21.0781 8.82573 20.3496 9.7861C19.1574 11.3591 17.6009 12.336 15.6305 12.601C14.0079 12.8162 12.5011 12.5016 11.1764 11.5081C9.95114 10.5809 9.25571 9.35559 9.07357 7.83225C8.85832 6.02743 9.38817 4.40474 10.481 2.98076C11.6566 1.44086 13.2131 0.463937 15.1172 0.116219C16.6737 -0.165267 18.1639 0.0168707 19.5051 0.927561C20.3827 1.50709 21.0119 2.30188 21.4258 3.26224C21.5252 3.41126 21.459 3.49405 21.2603 3.54373Z"
              fill="#28203F"
            />
            <path
              d="M26.7409 12.7006C25.2341 12.6674 23.8598 12.2369 22.7008 11.2434C21.7238 10.399 21.1112 9.32271 20.9125 8.04775C20.6144 6.17669 21.1277 4.52089 22.2537 3.04723C23.4624 1.45766 24.9195 0.629757 26.8899 0.282039C28.5788 -0.0160053 30.1684 0.149575 31.609 1.1265C32.9171 2.02063 33.7284 3.22937 33.9436 4.81894C34.2251 7.05427 33.5794 8.87565 32.0395 10.4321C30.9466 11.5415 29.6054 12.2369 28.0656 12.5515C27.6185 12.6343 27.1714 12.6509 26.7409 12.7006ZM30.6817 6.01111C30.6652 5.79586 30.6652 5.63028 30.632 5.4647C30.334 3.82545 28.8272 2.89821 27.2542 3.26248C25.7143 3.6102 24.7208 4.58712 24.3566 6.14358C24.0585 7.4351 24.6877 8.74318 25.8799 9.27304C26.7906 9.67043 27.7013 9.62076 28.5789 9.17369C29.8869 8.49481 30.5989 7.4351 30.6817 6.01111Z"
              fill="#28203F"
            />
          </g>
          <defs>
            <clipPath id="clip0_2296_1186">
              <rect
                width="34.0102"
                height="12.7"
                fill="white"
                transform="translate(-0.000488281)"
              />
            </clipPath>
          </defs>
        </svg>
      );
    case "java":
      return (
        <svg
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={"max-w-[50px]"}
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M21.6916 24.1584C21.6916 24.1584 20.7948 24.6804 22.3306 24.8565C24.1913 25.069 25.1422 25.0384 27.1921 24.6509C27.1921 24.6509 27.7322 24.9887 28.4851 25.2813C23.8882 27.2508 18.0813 25.1672 21.6916 24.1584Z"
            fill="#28203F"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M21.1299 21.5881C21.1299 21.5881 20.124 22.3329 21.6608 22.4918C23.6487 22.697 25.218 22.7138 27.935 22.1909C27.935 22.1909 28.3099 22.5718 28.9004 22.7799C23.3433 24.4054 17.1538 22.9078 21.1299 21.5881Z"
            fill="#28203F"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M25.8653 17.2269C26.9986 18.5315 25.5681 19.7044 25.5681 19.7044C25.5681 19.7044 28.444 18.2201 27.1236 16.3604C25.8898 14.6269 24.944 13.7658 30.0647 10.7961C30.0647 10.7961 22.0264 12.8032 25.8653 17.2269Z"
            fill="#28203F"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M31.9447 26.0602C31.9447 26.0602 32.6085 26.6074 31.2135 27.0306C28.5607 27.8341 20.1704 28.0765 17.84 27.0628C17.0028 26.6982 18.5734 26.1928 19.0676 26.086C19.5829 25.9746 19.8771 25.9949 19.8771 25.9949C18.9454 25.3388 13.8552 27.2834 17.2918 27.8411C26.6637 29.3602 34.3753 27.1569 31.9447 26.0602Z"
            fill="#28203F"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M22.1232 18.9243C22.1232 18.9243 17.8559 19.9381 20.6121 20.3066C21.7762 20.4624 24.0955 20.4265 26.2574 20.2451C28.0238 20.0969 29.7964 19.7798 29.7964 19.7798C29.7964 19.7798 29.174 20.0468 28.7234 20.3543C24.3892 21.4943 16.0178 20.9634 18.4282 19.7979C20.4657 18.8122 22.1232 18.9243 22.1232 18.9243Z"
            fill="#28203F"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M29.779 23.2032C34.1846 20.9145 32.1474 18.7148 30.7255 19.0111C30.3778 19.0836 30.2218 19.1465 30.2218 19.1465C30.2218 19.1465 30.3514 18.9435 30.598 18.8562C33.411 17.8678 35.5738 21.7726 29.6909 23.319C29.6909 23.319 29.7585 23.2577 29.779 23.2032Z"
            fill="#28203F"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M27.1233 6C27.1233 6 29.5627 8.44076 24.8089 12.1929C20.9967 15.2039 23.9397 16.9201 24.8076 18.8819C22.5821 16.8742 20.9498 15.1065 22.0447 13.4616C23.6525 11.0474 28.1073 9.87654 27.1233 6Z"
            fill="#28203F"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M22.5568 29.407C26.7847 29.6773 33.2789 29.2566 33.4326 27.2559C33.4326 27.2559 33.1372 28.0143 29.9382 28.6161C26.3292 29.2956 21.8769 29.2165 19.2373 28.7806C19.2373 28.7806 19.7781 29.2282 22.5568 29.407Z"
            fill="#28203F"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M33.2377 32.9951H33.1089V32.9231H33.4557V32.9951H33.3274V33.3549H33.2376V32.9951H33.2377ZM33.93 33.0133H33.9284L33.8005 33.3549H33.7417L33.6147 33.0133H33.6134V33.3549H33.5283V32.9231H33.6531L33.7707 33.2288L33.8886 32.9231H34.0127V33.3549H33.9301L33.93 33.0133Z"
            fill="#28203F"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M21.8641 37.0518C21.4654 37.3974 21.0438 37.5918 20.6654 37.5918C20.1263 37.5918 19.8339 37.2679 19.8339 36.7495C19.8339 36.1884 20.147 35.7777 21.4007 35.7777H21.8641V37.0518ZM22.9647 38.2934V34.4499C22.9647 33.4674 22.4044 32.8191 21.0542 32.8191C20.2663 32.8191 19.5756 33.0139 19.014 33.2619L19.1756 33.9427C19.6179 33.7802 20.1898 33.6294 20.7514 33.6294C21.5294 33.6294 21.8641 33.9427 21.8641 34.5906V35.0765H21.4753C19.5855 35.0765 18.7329 35.8094 18.7329 36.912C18.7329 37.8617 19.2949 38.4018 20.3527 38.4018C21.0325 38.4018 21.5406 38.121 22.0149 37.7102L22.1013 38.2934H22.9647Z"
            fill="#28203F"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M26.6374 38.2933H25.2649L23.6128 32.9172H24.8115L25.837 36.2208L26.065 37.2133C26.5826 35.7777 26.9497 34.3201 27.1333 32.9172H28.2991C27.9874 34.6874 27.4249 36.6307 26.6374 38.2933Z"
            fill="#28203F"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M31.9034 37.0518C31.5034 37.3974 31.0817 37.5918 30.7043 37.5918C30.165 37.5918 29.8726 37.2679 29.8726 36.7495C29.8726 36.1884 30.1863 35.7777 31.4389 35.7777H31.9033V37.0518H31.9034ZM33.0044 38.2934V34.4499C33.0044 33.4674 32.4425 32.8191 31.0935 32.8191C30.3046 32.8191 29.614 33.0139 29.0524 33.2619L29.2143 33.9427C29.6568 33.7802 30.2295 33.6294 30.791 33.6294C31.568 33.6294 31.9033 33.9427 31.9033 34.5906V35.0765H31.5146C29.6243 35.0765 28.772 35.8094 28.772 36.912C28.772 37.8617 29.3332 38.4018 30.391 38.4018C31.0713 38.4018 31.5785 38.121 32.054 37.7102L32.141 38.2934H33.0044Z"
            fill="#28203F"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M17.5257 39.2069C17.2122 39.6651 16.705 40.0281 16.1504 40.2327L15.6069 39.5926C16.0295 39.3756 16.3914 39.0258 16.5598 38.7001C16.705 38.4098 16.7655 38.0367 16.7655 37.1434V31.0049H17.9352V37.0588C17.9352 38.2535 17.8398 38.7365 17.5257 39.2069Z"
            fill="#28203F"
          />
        </svg>
      );
    case "python":
      return <IconBrandPython class="w-10 h-10" />;
  }
  return <IconQuestionMark class="w-6 h-6" />;
};