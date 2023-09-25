uniform sampler2D uTexture;
uniform float uProgress;
uniform float uNbLines;
uniform float uNbColumns;

varying vec2 vTextCoords;

float circle(vec2 uv, float border){
    float radius = 0.5;
    float dist  = radius - distance(uv, vec2(0.5));
    return smoothstep(0.0, border, dist);
}

void main() {

    vec2 uv = gl_PointCoord;
    uv.y *= -1.0;

    uv /= vec2(uNbLines, uNbColumns);
    float texOffsetU = vTextCoords.x / uNbLines;

    float texOffsetV = vTextCoords.y / uNbColumns;
    uv += vec2(texOffsetU, texOffsetV);

    uv += vec2(0.5);

    vec4 texture = texture2D(uTexture, uv);
	gl_FragColor = texture;
    if  (gl_FragColor.r < 0.1){
        discard;
    }
    gl_FragColor.a *= circle(gl_PointCoord, 0.2);
    gl_FragColor.a *= uProgress;
}
