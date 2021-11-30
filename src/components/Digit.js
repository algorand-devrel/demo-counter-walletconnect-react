import React from 'react'
import { Spring } from 'react-spring/renderprops'

const number = [
    {
        value: 0,
        active: [0, 1, 2, 4, 5, 6],
    },
    {
        value: 1,
        active: [2, 6],
    },
    {
        value: 2,
        active: [1, 2, 3, 4, 5],
    },
    {
        value: 3,
        active: [1, 2, 3, 5, 6],
    },
    {
        value: 4,
        active: [0, 2, 3, 6],
    },
    {
        value: 5,
        active: [0, 1, 3, 5, 6],
    },
    {
        value: 6,
        active: [0, 1, 3, 4, 5, 6],
    },
    {
        value: 7,
        active: [1, 2, 6],
    },
    {
        value: 8,
        active: [0, 1, 2, 3, 4, 5, 6],
    },
    {
        value: 9,
        active: [0, 1, 2, 3, 5, 6],
    },
];

const lineArray = [
    '40,80 60,60 80,80 80,160 60,180 40,160',
    '63,57 83,37 147,37 167,57 147,77 83,77',
    '150,80 170,60 190,80 190,160 170,180 150,160',
    '63,183 83,163 147,163 167,183 147,204 83,204',
    '40,206 60,187 80,207 80,287  60,307 40,287',
    '63,310 83,290 147,290 167,310 147,330 83,330',
    '150,206 169,187 190,207 190,287  170,307 150,287',
];

const Digit = ({
    nums,
    width = "100%",
    height = "50%",
    color = "#FF0000",
    unActiveColor = "#22221e",
    backgroundColor = "#000",
    transition = 'none',
    transform = false,
    transformDuration = 600,
}) => {
    let numsArray = nums ? nums.split('') : [1, 2, 3];
    numsArray = numsArray.filter((item) => /[0-9]/g.test(item))
    // const props = useSpring({ number: 1, from: { number: 0 } })
    return (
        <div
            style={{
                background: backgroundColor,
                display: 'flex',
                width: width,
                height: height,
                transition: transition ? transition : 'none',
            }}
        >
            {numsArray.map((item, index) => {
                
                return (
                    <Spring
                        key={`${item}-${index}`}
                        from={{ number: 0 }}
                        to={{ number: parseInt(item, 10) }}
                        config={{ duration: transformDuration }}
                    >
                        {props => {
                            return (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 228 376"
                                    width="100%"
                                    height="100%"
                                    xmlnsXlink="http://www.w3.org/1999/xlink"
                                >
                                    <g>
                                        {lineArray.map((line, lineIndex) => {
                                            return (
                                                <polygon
                                                    key={line}
                                                    points={line}
                                                    style={{ fill: number[transform ? Math.ceil(props.number) : item].active.includes(lineIndex) ? color : unActiveColor }}
                                                />
                                            );
                                        })}
                                    </g>
                                </svg>)
                        }}
                    </Spring>
                );
            })}
        </div>
    );
};
// Render app
export default Digit