
#include <stdlib.h>
#include <exception>
#include <iostream>

#include <SDL/SDL.h>

#include <GL/glew.h>
#include <GL/glu.h>

#include "Exceptions.h"
#include "Utils.h"
#include "BaseApp.h"
#include "Game.h"

using namespace std;


// Pointer to active application instance, which will recieve and handle SDL events
BaseApp* application = NULL;


SDL_Surface * init(unsigned width, unsigned height, unsigned color, unsigned depth, unsigned stencil)
{
    // Set OpenGL attributes
    if(SDL_GL_SetAttribute(SDL_GL_BUFFER_SIZE, color) < 0) throw SDL_Exception();
    if(SDL_GL_SetAttribute(SDL_GL_DEPTH_SIZE, depth) < 0) throw SDL_Exception();
    if(SDL_GL_SetAttribute(SDL_GL_STENCIL_SIZE, stencil) < 0) throw SDL_Exception();
    if(SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, 1) < 0) throw SDL_Exception();

    // Create window
    SDL_Surface * screen = SDL_SetVideoMode(width, height, color, SDL_OPENGL | SDL_RESIZABLE);
    if(screen == NULL) throw SDL_Exception();

	// Inicializace glew
	GLenum err = glewInit();
	if (GLEW_OK != err) {
		/* Problem: glewInit failed, something is seriously wrong. */
		fprintf(stderr, "Error: %s\n", glewGetErrorString(err));
	}
	fprintf(stdout, "Status: Using GLEW %s\n", glewGetString(GLEW_VERSION));

	// Create the Game and set as current application
	application = new Game;

    // Call init code
    application->onInit();
    application->onWindowResized(width, height);

    return screen;
}




// Simple main loop
void mainLoop()
{
    // Window is not minimized
    bool active = true;

    for(;;) // Infinite loop
    {
        SDL_Event event;

        // Wait for event
        if(SDL_WaitEvent(&event) == 0) throw SDL_Exception();

        // Screen needs redraw
        bool redraw = false;

        // Handle all waiting events
        do
        {
            // Call proper event handlers
            switch(event.type)
            {
                // Stop redraw when minimized
				case SDL_ACTIVEEVENT :
                    if(event.active.state == SDL_APPACTIVE)
                        active = (event.active.gain != 0);
                    break;

				// Set redraw flag
                case SDL_VIDEOEXPOSE :
                    redraw = true;
                    break;
					
				// End main loop
				case SDL_QUIT :
                    return;

				// Pass UI events to the app
                case SDL_KEYDOWN :                    
                case SDL_KEYUP :                    
                case SDL_MOUSEMOTION :                    
                case SDL_MOUSEBUTTONDOWN :                    
                case SDL_MOUSEBUTTONUP :                    
                case SDL_VIDEORESIZE :
					application->handleEvent(event);
					break;

				// Do nothing
                default :
                    break;
            }
        } while(SDL_PollEvent(&event) == 1);

        // Optionally redraw window
        if (active && redraw) application->onWindowRedraw();
    }
}




int main(int /*argc*/, char ** /*argv*/) 
{
    try {
        // Init SDL - only video subsystem will be used
        if(SDL_Init(SDL_INIT_VIDEO) < 0) throw SDL_Exception();

        // Shutdown SDL when program ends
        atexit(SDL_Quit);

		// initialize application
        init(800, 600, 24, 24, 8);

		// start the main loop
		mainLoop();

    } catch(exception & ex) {
        cout << "ERROR : " << ex.what() << endl;
        return EXIT_FAILURE;
    }

    return EXIT_SUCCESS;
}