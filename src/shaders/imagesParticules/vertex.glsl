uniform float uPointSize;
uniform float uProgress;
uniform float uFrequency;
uniform float uTime;
varying vec2 vTextCoords;
varying vec3 uMousePos;

attribute vec3 initPosition;

const float amplitude = 2.;


void main() {

	#include <begin_vertex>

	transformed = initPosition + ((position - initPosition) * uProgress);

	transformed.z += sin(transformed.x * uFrequency + uTime) * amplitude;
	transformed.z += sin(transformed.y * uFrequency + uTime) * amplitude;
	#include <project_vertex>

	vec3 seg = position - uMousePos;
        vec3 dir = normalize(seg);
        float dist = length(seg);
        if (dist < 2.){
          float force = clamp(1. / (dist * dist), 0., 1.);
          transformed += dir * force;
        }

	

	gl_PointSize = uPointSize;

	vTextCoords = position.xy;


}


