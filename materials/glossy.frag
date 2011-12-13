// +------------------------------------------------------------+
// |                      University Racer                      |
// |         Projekt do PGR a GMU, FIT VUT v Brne, 2011         |
// +------------------------------------------------------------+
// |  Autori:  Tom� Kimer,  xkimer00@stud.fit.vutbr.cz         |
// |           Tom� Sychra, xsychr03@stud.fit.vutbr.cz         |
// |           David �abata, xsabat01@stud.fit.vutbr.cz         |
// +------------------------------------------------------------+

#version 130

//Studium osvetlovaciho modelu
//potrebne zdroje:
//point-light(studium): http://www.lighthouse3d.com/tutorials/glsl-tutorial/point-light-per-pixel/
//blinn-phong(studium): http://www.opengl.org/sdk/docs/tutorials/ClockworkCoders/lighting.php

#define MAX_LIGHTS 4
#define ONE_DIV_MAX_LIGHTS 0.25
uniform vec4 lights[30]; // kazde tri vektory odpovidaji jednomu svetlu: pozice, difuzni, ambientni slozka; max 10 svetel
uniform int enabledLights; // pocet pouzitych svetel (naplnenych do lights)

//zdroj : http://www.ogre3d.org/tikiwiki/-Point+Light+Attenuation
#define LINEAR_ATTENUATION 0.022
#define QUADR_ATTENUATION 0.0019  

//vlastnosti materialu
struct Material {
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
	int shininess;
};
uniform Material material;

//umoznuji vybrat ktere svetlo se bude kreslit
uniform bool paintDiffSpec;
uniform bool paintAmbient;

in vec3 eyeNormal; // normala zkomaneho bodu v prostoru OKA
in vec3 eyePosition; // pozice zkoumaneho bodu v prostoru OKA
in vec3 eyeLightPos[MAX_LIGHTS]; //pozice svetel v prostoru OKA

in vec3 oPosition; //pozice vertexu

uniform sampler2D texture1;
uniform bool useTexture;

in vec2 t; //texturovaci souradnice

out vec4 fragColor; //vystupni barva

void main() {
	vec3 lightDir;
	float radius = 1.0;

	//kdyz je vse zhasnute, bude tma
	vec4 finalColor = vec4(0.0,0.0,0.0,1.0);

	vec3 N = normalize(eyeNormal);

	//v eyespace muzeme povazovat za vektor pozorovatele eyePosition, jeho otocenim tak ziskame 
	//vektor z plosky do pozorovaele
	vec3 V = normalize(-eyePosition);

	//konstanty potrebne pro slabnuti svetla

	float constantAtt = 1.0;
	//////////////////////////////////////SVETLA/////////////////////////////////////
	for(int i = 0; i < enabledLights ; i++) {
		
		//urcuje zda-li dojde k vykresleni ambientni slozky svetla
		if(paintAmbient)
			finalColor += material.ambient * lights[i * 3 + 2];

		lightDir = eyeLightPos[i] - eyePosition;

		//zajistuje slabnuti svetla s pribyvajici vzdalenosti od zdroje
		float attenuation, distance;
		distance = length(lightDir / radius);	 
		attenuation = 1.0 / (constantAtt + LINEAR_ATTENUATION * distance +
										   QUADR_ATTENUATION * distance * distance);
									  
		vec3 L = normalize(lightDir);

		//urcuje zda-li se bude vykreslovat diffuzni a spekularni slozka svetla
		if(paintDiffSpec) {
			//difuzni slozka
			float diffuse = max(dot(N,L),0.0);
			vec4 diffuseF = 	material.diffuse * lights[i * 3 + 1]; // i - index svetla
			vec4 diff = attenuation * diffuse * diffuseF;
	
			//vypocet half vectoru (HV)
			//halfvector = L + V - mezi light a pozorovatelem
			vec3 H = normalize(L + V);
	
			//spocitame spekularni odlesk
			float specular = pow(dot(N,H), material.shininess);
	
			vec4 spec = vec4(0.0,0.0,0.0,1.0);
			//pricteme spekul�rn� slo�ku k v�sledn� barvi
			if(specular >= 0.0)
				spec = attenuation *  specular * material.specular;
			finalColor +=  diff +  spec;
		}
	} 
	//pokud je zapnuta textura1, pak ji namichej do barvy
	if(useTexture)
		finalColor = (texture(texture1, t)) * finalColor;
	fragColor = finalColor;

}
