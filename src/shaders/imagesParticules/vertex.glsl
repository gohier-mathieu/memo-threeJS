uniform float uPointSize;
uniform float uProgress;
uniform float uFrequency;
uniform float uTime;
varying vec2 vTextCoords;

attribute vec3 initPosition;

const float amplitude = 2.;

void main() {

	#include <begin_vertex>

	transformed = initPosition + ((position - initPosition) * uProgress);

	transformed.z += sin(transformed.x * uFrequency + uTime) * amplitude;
	transformed.z += sin(transformed.y * uFrequency + uTime) * amplitude;
	#include <project_vertex>

	gl_PointSize = uPointSize;

	vTextCoords = position.xy;

}


