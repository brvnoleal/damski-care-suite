import { cn } from "@/lib/utils";

interface AnimatedSwitchSvgProps {
  className?: string;
}

/**
 * Inline animated switch SVG (Switch_Action.svg).
 * Renders a 500x280 switch with SMIL animations; scales to the parent size.
 */
export const AnimatedSwitchSvg = ({ className }: AnimatedSwitchSvgProps) => {
  return (
    <svg
      fill="none"
      height="100%"
      width="100%"
      viewBox="0 0 500 280"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("block", className)}
    >
      <g transform="matrix(0.986,0,0,0.986,3.326,1.754)">
        <g transform="matrix(1,0,0,1,250.25,140.25)">
          <path
            fill="#30d126"
            d="M110,140C110,140,-110,140,-110,140C-187.32,140,-250,77.32,-250,0C-250,-77.32,-187.32,-140,-110,-140C-110,-140,110,-140,110,-140C187.32,-140,250,-77.32,250,0C250,77.32,187.32,140,110,140Z"
          >
            <animate
              repeatCount="indefinite"
              attributeName="fill"
              dur="2.333s"
              begin="0s"
              fill="freeze"
              values="#30d126; #36cc2c; #3dc635; #45bf3e; #4db947; #55b24f; #5cad57; #61a85d; #67a463; #6ba068; #6f9d6c; #729a70; #759873; #789576; #7a9379; #7c927b; #7e907d; #808f7f; #818e80; #828d82; #848c83; #848b84; #858a85; #868a86; #878986; #878987; #878987; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #888888; #8b858c; #8b868b; #878987; #818e80; #799478; #729a6f; #6ba067; #64a660; #5eab59; #58b053; #53b44d; #4fb848; #4bbb44; #47be3f; #44c13c; #41c339; #3ec536; #3cc733; #3ac931; #38cb2f; #36cc2d; #35cd2b; #34ce2a; #33cf29; #32d028; #31d027; #31d027; #30d126; #30d126; #30d126; #30d126"
              keyTimes="0; 0.00715; 0.0143; 0.02145; 0.0286; 0.03575; 0.0429; 0.05005; 0.0572; 0.06435; 0.0715; 0.07865; 0.0858; 0.09295; 0.1001; 0.10725; 0.1144; 0.12155; 0.1287; 0.13585; 0.143; 0.15015; 0.1573; 0.16445; 0.1716; 0.17875; 0.1859; 0.19305; 0.2002; 0.20735; 0.2145; 0.224034; 0.233567; 0.2431; 0.252634; 0.262167; 0.2717; 0.281233; 0.290766; 0.3003; 0.309833; 0.319366; 0.3289; 0.338433; 0.347967; 0.3575; 0.367033; 0.376567; 0.3861; 0.395633; 0.405167; 0.4147; 0.424234; 0.433767; 0.4433; 0.452833; 0.462367; 0.4719; 0.481433; 0.490966; 0.5005; 0.50765; 0.5148; 0.521949; 0.529099; 0.536249; 0.543399; 0.550549; 0.557699; 0.564849; 0.571999; 0.579149; 0.586299; 0.593449; 0.600598; 0.607748; 0.614898; 0.622048; 0.629198; 0.636348; 0.643498; 0.650648; 0.657798; 0.664948; 0.672098; 0.679247; 0.686397; 0.693547; 0.700697; 0.707847; 0.714997; 1"
              calcMode="linear"
            />
          </path>
        </g>
      </g>
      <g transform="matrix(1,0,0,1,-0.25,-0.25)">
        <g transform="matrix(1,0,0,1,250.25,140.25)">
          <path
            fill="#f4f4f4"
            d="M110,-130C144.725,-130,177.37,-116.478,201.924,-91.924C226.478,-67.37,240,-34.724,240,0C240,34.725,226.478,67.37,201.924,91.924C177.37,116.478,144.725,130,110,130C110,130,-110,130,-110,130C-144.725,130,-177.37,116.478,-201.924,91.924C-226.478,67.37,-240,34.725,-240,0C-240,-34.725,-226.478,-67.37,-201.924,-91.924C-177.37,-116.478,-144.725,-130,-110,-130C-110,-130,110,-130,110,-130ZM110,-140C110,-140,-110,-140,-110,-140C-187.32,-140,-250,-77.32,-250,0C-250,77.32,-187.32,140,-110,140C-110,140,110,140,110,140C187.32,140,250,77.32,250,0C250,-77.32,187.32,-140,110,-140Z"
          />
        </g>
      </g>
      <g visibility="hidden">
        <animate
          repeatCount="indefinite"
          begin="0s"
          calcMode="discrete"
          dur="2.333s"
          values="hidden; visible; visible; visible"
          keyTimes="0; 0.500928; 0.999857; 1"
          attributeName="visibility"
        />
        <g transform="translate(20.312,140)">
          <animateTransform
            repeatCount="indefinite"
            type="translate"
            attributeName="transform"
            dur="2.333s"
            begin="0s"
            calcMode="spline"
            values="20.312 140; 20.312 140; 148.954 140; 481.003 140; 481.003 140"
            keyTimes="0; 0.5005; 0.5291; 0.714995; 1"
            keySplines="0 0 1 1; 0.167 0.167 0.642 0.549; 0.264 0.837 0.459 1; 0 0 1 1"
            fill="freeze"
          />
          <g transform="scale(1,1)">
            <g transform="translate(229.345,-1)">
              <animateTransform
                repeatCount="indefinite"
                type="translate"
                attributeName="transform"
                dur="2.333s"
                begin="0s"
                calcMode="spline"
                values="229.345 -1; 229.345 -1; 184.923 -1; 130.167 -1; 69.911 -1; 18.655 -1; -13.345 -1; -13.345 -1"
                keyTimes="0; 0.5005; 0.5148; 0.5291; 0.5434; 0.5577; 0.714995; 1"
                keySplines="0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0.167 0.298 0.19 1; 0 0 1 1"
                fill="freeze"
              />
              <g transform="matrix(1.003,0,0,0.992,-108.25,1)">
                <rect
                  ry="125"
                  rx="125"
                  height="242"
                  width="242"
                  y="-121"
                  x="-121"
                  fill="#ffffff"
                >
                  <animate
                    repeatCount="indefinite"
                    attributeName="width"
                    dur="2.333s"
                    begin="0s"
                    fill="freeze"
                    values="242; 242; 360; 242; 242"
                    keyTimes="0; 0.5005; 0.5577; 0.714995; 1"
                    keySplines="0 0 1 1; 0 0 1 1; 0.167 0.167 0.19 1; 0 0 1 1"
                    calcMode="spline"
                  />
                </rect>
              </g>
            </g>
          </g>
        </g>
      </g>
      <g visibility="visible">
        <animate
          repeatCount="indefinite"
          begin="0s"
          calcMode="discrete"
          dur="2.333s"
          values="visible; hidden; hidden; hidden"
          keyTimes="0; 0.500928; 0.999857; 1"
          attributeName="visibility"
        />
        <g transform="translate(480.003,140)">
          <animateTransform
            repeatCount="indefinite"
            type="translate"
            attributeName="transform"
            dur="2.333s"
            begin="0s"
            calcMode="spline"
            values="480.003 140; 20.312 140; 20.312 140"
            keyTimes="0; 0.214495; 1"
            keySplines="0.167 0.167 0.19 1; 0 0 1 1"
            fill="freeze"
          />
          <g transform="scale(1,1)">
            <g transform="translate(-230.345,-1)">
              <animateTransform
                repeatCount="indefinite"
                type="translate"
                attributeName="transform"
                dur="2.333s"
                begin="0s"
                calcMode="spline"
                values="-230.345 -1; -193.923 -1; -129.5 -1; -71.077 -1; -24.655 -1; 12.345 -1; 12.345 -1"
                keyTimes="0; 0.0143; 0.0286; 0.0429; 0.0572; 0.214495; 1"
                keySplines="0 0 1 1; 0 0 1 1; 0 0 1 1; 0 0 1 1; 0.167 0.298 0.19 1; 0 0 1 1"
                fill="freeze"
              />
              <g transform="matrix(1.003,0,0,0.992,109,1)">
                <rect
                  ry="125"
                  rx="125"
                  height="242"
                  width="242"
                  y="-121"
                  x="-121"
                  fill="#ffffff"
                >
                  <animate
                    repeatCount="indefinite"
                    attributeName="width"
                    dur="2.333s"
                    begin="0s"
                    fill="freeze"
                    values="242; 360; 242; 242"
                    keyTimes="0; 0.0572; 0.214495; 1"
                    keySplines="0 0 1 1; 0.167 0.167 0.19 1; 0 0 1 1"
                    calcMode="spline"
                  />
                </rect>
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};
