type PawnColors = {
    body: string
    topSphere: string
    base: string
}
const PawnSvg = ({ body, topSphere, base }: PawnColors) => {
    return (
        <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">
                {/* <!-- Blue Pawn --> */}
                <g transform="translate(300, 20) scale(2.5)">
                    {/* <!-- Base --> */}
                    <path d="M20 160 L100 160 L90 140 L30 140 Z" fill={base} />
                    {/* <!-- Body --> */}
                    <path d="M35 140 L85 140 L75 60 L45 60 Z" fill={body} />
                    {/* <!-- Top sphere --> */}
                    <circle cx="60" cy="45" r="25" fill={topSphere} />
                    {/* <!-- Highlights --> */}
                    <ellipse cx="50" cy="45" rx="8" ry="12" fill="#ffffff" opacity="0.3" transform="rotate(-30 50 45)" />
                    <ellipse cx="70" cy="100" rx="4" ry="15" fill="#ffffff" opacity="0.2" transform="rotate(-10 70 100)" />
                    {/* <!-- Star highlight --> */}
                    <path d="M45 35 L48 38 L45 41 L42 38 Z" fill="#ffffff" opacity="0.8" />
                </g>
            </svg>
        </>
    );
}

export default PawnSvg;