#ifndef MATERIAL3DSOBJECT_H
#define MATERIAL3DSOBJECT_H

#include <string>
#include "../chunk/chunk.h"

struct Mesh3Dcolor
{
	float r, g, b;
};

/***/
class Material3DSObject
{
    public:
	/***/
	Material3DSObject(Model3DSChunk c);
	/***/
	~Material3DSObject();

	const std::string &Name();
	const std::string &Texture();
	const Mesh3Dcolor &AmbientColor();
	const Mesh3Dcolor &DiffuseColor();
	const Mesh3Dcolor &SpecularColor();
	const int Shininess();
    private:
	std::string name;
	Mesh3Dcolor ambientColor;
	Mesh3Dcolor diffuseColor;
	Mesh3Dcolor specularColor;
	int shininess;
};

#endif
