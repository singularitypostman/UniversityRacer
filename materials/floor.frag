#version 130

#define MAX_LIGHTS 4
#define LINEAR_ATTENUATION 0.006
#define QUADR_ATTENUATION 0.0001 

// @LOAD materials/textures/floor.bmp
uniform sampler2D tex;

// @LOAD materials/textures/floor_bump.bmp
uniform sampler2D texNormal;

uniform mat3 mv_inverse_transpose;
uniform mat4 view;

uniform vec4 lights[30]; // kazde tri vektory odpovidaji jednomu svetlu: pozice, difuzni, ambientni slozka; max 10 svetel
uniform int enabledLights; // pocet pouzitych svetel (naplnenych do lights)

struct Material {
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
	int shininess;
};
uniform Material material;

in vec3 eyeNormal; // normala zkomaneho bodu v prostoru OKA
in vec3 eyePosition; // pozice zkoumaneho bodu v prostoru OKA

in vec3 eyeLightPos[MAX_LIGHTS];

in vec4 specularF;

in vec4 color;
in vec2 t;

void main() {
	
	vec4 ambientF, diffuseF, specularF, shininessF;
	vec3 lightDir;
	float radius = 1.0;
	float scaleCoord = 2.0;
	//kdyz je vse zhasnute, bude tma
	vec4 finalColor = vec4(0.0,0.0,0.0,1.0);

	//////////////////////////////////JEDNODUCHY BUMP MAPPING////////////////////////////
	//prevedeme normaly do eyespace	 
	vec3 N = normalize(eyeNormal);

	//vypocet half vectoru (HV)
	//v eyespace muzeme povazovat za vektor pozorovatele eyePosition, jeho otocenim tak ziskame 
	//vektor z plosky do pozorovaele
	vec3 V = normalize(-eyePosition);

	//////////////////////////////////////SVETLA/////////////////////////////////////
	for(int i = 0; i < MAX_LIGHTS ; i++) {
		
		finalColor += material.ambient * lights[i * 3 + 2];

		lightDir = eyeLightPos[i] - eyePosition;

		//slabnuti svetla
		float attenuation, distance;
		distance = length(lightDir / radius);	 

		float constantAtt = 1.0;
		float linearAtt = LINEAR_ATTENUATION;
		float quadraticAtt = QUADR_ATTENUATION;
		attenuation = 1.0 / (constantAtt + linearAtt * distance +
										   quadraticAtt * distance * distance);
									  
		vec3 L = normalize(lightDir);

	
		//difuzni slozka
		float diffuse = max(dot(N,L),0.0);
		diffuseF = 	material.diffuse * lights[i * 3 + 1];
		vec4 diff = attenuation * diffuse * diffuseF;
	
		//halfvector = L + V - mezi light a pozorovatelem
		vec3 H = normalize(L + V);
	
		//spocitame spekularni odlesk
		float specular = pow(dot(N,H), material.shininess * 100); //TODO nastavit vic v modelu, nebo se domluvit vo s tim
	
		vec4 spec = vec4(0.0,0.0,0.0,1.0);
		//pricteme spekul�rn� slo�ku k v�sledn� barv�
		if(specular >= 0.0)
			spec = attenuation *  specular * material.specular;
		finalColor +=  diff +  spec;
	} 
			
	gl_FragColor = finalColor * texture(tex,t * scaleCoord) ;
}
