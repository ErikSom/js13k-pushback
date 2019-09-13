const lvls = [];

lvls[0] = {
    shaderFunctions:
    `
    void title(vec2 u, inout float r)
    {
        float w = 0.05;
        drawLine(r, u, vec2(-0.5, 0.73), vec2(-0.5, 0.51), w);
        drawLine(r, u, vec2(-0.21, 0.6), vec2(-0.21, 0.72), w);
        drawLine(r, u, vec2(-0.09, 0.6), vec2(-0.09, 0.72), w);
        drawLine(r, u, vec2(0.37, 0.71), vec2(0.37, 0.51), w);
        drawLine(r, u, vec2(0.38, 0.61), vec2(0.48, 0.61), w);
        drawLine(r, u, vec2(0.49, 0.71), vec2(0.49, 0.51), w);
        drawLine(r, u, vec2(-0.5, 0.38), vec2(-0.5, 0.14), w);
        drawLine(r, u, vec2(-0.22, 0.15), vec2(-0.16, 0.37), w);
        drawLine(r, u, vec2(-0.16, 0.37), vec2(-0.08, 0.15), w);
        drawLine(r, u, vec2(-0.19, 0.26), vec2(-0.12, 0.26), w);
        drawLine(r, u, vec2(0.37, 0.37), vec2(0.37, 0.14), w);
        drawLine(r, u, vec2(0.42, 0.25), vec2(0.49, 0.37), w);
        drawLine(r, u, vec2(0.42, 0.25), vec2(0.49, 0.14), w);
        w = 1.5;
        drawDonut(r, u, vec2(-0.42, 0.67), 0.06, 0.5, 0.64, w);
        drawDonut(r, u, vec2(-0.15, 0.57), 0.06, 0.75, 0.52, w);
        drawDonut(r, u, vec2(0.15, 0.66), 0.06, 0.11, 0.64, w);
        drawDonut(r, u, vec2(0.15, 0.55), 0.06, 0.63, 0.64, w);
        drawDonut(r, u, vec2(-0.42, 0.21), 0.06, 0.5, 0.64, w);
        drawDonut(r, u, vec2(-0.43, 0.33), 0.05, 0.5, 0.64, w);
        w = 1.0;
        drawDonut(r, u, vec2(0.17, 0.25), 0.11, 0., 0.56, w);
    }
    float terrainHeight(vec2 u)
    {
        float r = -1.;
        title(u, r);
        finalDestTrr(u, r);
        return r;
    }
    vec2 waterCurrents(vec2 u)
    {
        return vec2(fn(u*4.-99., 6.3, 6.),
                    fn(u*4.+99., 6.3, 6.))*.5-.25;
    }
    vec4 objectsShape(vec2 u)
    {
        vec4 r = vec4(0.);
        float a = 0.;
        title(u+vec2(.0,.6), a);
        r+= float(a>.2)*vec4(.4,.6,.4,1.);
        return r;
    }
    vec4 mapDecorations(vec2 u)
    {
        vec4 r = terrainHeight(u)*vec4(.7,.7,.6,1.)+.3;     //color of the terrain
        r = max(r,vec4(.2,.3,.4,.0)-.1*fn(u*64.,6.3,4.));   //color of deep ocean
        finalDestDeco(u, r);
        return r;
    }`,
    waterQuantity: .5,
    myBoatsColor: [100,170,100,1],   //[red, green, blue, destroyable boat = 1]
                                                    //                   invincible  boat = 0
    finalDestinationCorner: [1,1],   //[ 1, 1] = [Top   , Right]
                                                    //[-1, 1] = [Top   ,  Left]
                                                    //[ 1,-1] = [Bottom, Right]
                                                    //[-1,-1] = [Bottom,  Left]
}

lvls[1] = {
    shaderFunctions:
    `
    float terrainHeight(vec2 u)
    {
        float r = -1.;
        float w = 0.05;
        drawLine(r, u,-vec2(0.85, 0.38),-vec2(0.38, 0.85), w);
        drawLine(r, u,-vec2(0.85, 0.38), vec2(0.38, 0.85), w);
        drawLine(r, u,-vec2(0.38, 0.85), vec2(0.85, 0.38), w);
        finalDestTrr(u, r);
        return r;
    }
    vec2 waterCurrents(vec2 u)
    {
        return vec2(0.);
    }
    vec4 objectsShape(vec2 u)
    {
        vec4 r = vec4(0.);
        vec2 a;
        float angle = 0.78;
        vec2 dir = sin(angle + vec2(0.,1.57));

        a = (u+vec2(.4,.4))*12.;
        a = a*mat2(dir ,dir .yx*vec2(-1.,1.));
        // a = abs(a)-2.5;
        a = vec2(max(abs(a.x)-1.,0.),a.y);
        a = abs(a);
        r+= float(1.-a.y-a.x >= 0.)*myBoatsColor();

        return r;
    }
    vec4 mapDecorations(vec2 u)
    {
        vec4 r = terrainHeight(u)*vec4(.7,.7,.6,1.)+.3;     //color of the terrain
        r = max(r,vec4(.2,.3,.4,.0)-.1*fn(u*64.,6.3,4.));   //color of deep ocean
        finalDestDeco(u, r);
        return r;
    }
    `,
    waterQuantity: .5,
    myBoatsColor: [100,170,100,1],   //[red, green, blue, destroyable boat = 1]
                                                    //                   invincible  boat = 0
    finalDestinationCorner: [1,1],   //[ 1, 1] = [Top   , Right]
                                                    //[-1, 1] = [Top   ,  Left]
                                                    //[ 1,-1] = [Bottom, Right]
                                                    //[-1,-1] = [Bottom,  Left]
}

lvls[2] = {
    shaderFunctions:
    `
    float terrainHeight(vec2 u)
    {
        float r = -1.;
        float w = 0.3;
        drawDonut(r, u, vec2(-0.59, -0.05), 0.35, 0.08, 0.76, w);
        drawDonut(r, u, vec2(0.05, 0.58), 0.35, 0.91, 0.34, w);
        drawDonut(r, u, vec2(0.06, 0.59), 0.35, 0.34, 0.34, w);
        //drawDonut(r, u, vec2(0.41, 0.22), 0.35, 0.63, 0.74, w);
        finalDestTrr(u, r);
        return r;
    }
    vec2 waterCurrents(vec2 u)
    {
        vec2 v = vec2(.0);
        drawCurrent(v, u, vec2(-0.28, -0.35), vec2(2.1, 2.1), vec2(-0.69, 0.72));
        return v;
    }
    vec4 objectsShape(vec2 u)
    {
        vec4 r = vec4(0.);
        vec2 a;

        float angle = -.78;
        vec2 dir = sin(angle + vec2(0.,1.57));
        a = (u+vec2(.0,-.6))*12.;
        a = a*mat2(dir ,dir .yx*vec2(-1.,1.));
        a = vec2(max(abs(a.x)-1.,0.),a.y);
        a = abs(a);
        r+= float(1.-a.y-a.x >= 0.)*myBoatsColor();

        dir = sin(angle + vec2(0.,1.57));
        a = (u+vec2(.6,.0))*12.;
        a = a*mat2(dir ,dir .yx*vec2(-1.,1.));
        a = vec2(max(abs(a.x)-1.,0.),a.y);
        a = abs(a);
        r+= float(1.-a.y-a.x >= 0.)*myBoatsColor();

        a = (u+vec2(-.35,-.25))*12.;
        r+= float(1.-length(a) >= 0.)*vec4(.6,.4,.4,1.);

        return r;
    }
    vec4 mapDecorations(vec2 u)
    {
        vec4 r = terrainHeight(u)*vec4(.7,.7,.6,1.)+.3;     //color of the terrain
        r = max(r,vec4(.2,.3,.4,.0)-.1*fn(u*64.,6.3,4.));   //color of deep ocean
        finalDestDeco(u, r);
        return r;
    }
    `,
    waterQuantity: .5,
    myBoatsColor: [100,170,100,1],   //[red, green, blue, destroyable boat = 1]
                                                    //                   invincible  boat = 0
    finalDestinationCorner: [1,-1],   //[ 1, 1] = [Top   , Right]
                                                    //[-1, 1] = [Top   ,  Left]
                                                    //[ 1,-1] = [Bottom, Right]
                                                    //[-1,-1] = [Bottom,  Left]
}
lvls[3] = {
    shaderFunctions:
    `
    float terrainHeight(vec2 u)
    {
        float r = -1.;
        float w = 0.05;
        drawLine(r, u, vec2(0.96, 0.92), vec2(0.26, 0.92), w);
        drawLine(r, u, vec2(0.26, 0.92), vec2(0.26, 0.31), w);
        drawLine(r, u, vec2(0.26, 0.31), vec2(0.96, 0.31), w);
        drawLine(r, u, vec2(-0.99, 0.92), vec2(-0.26, 0.92), w);
        drawLine(r, u, vec2(-0.26, 0.92), vec2(-0.24, -0.98), w);
        finalDestTrr(u, r);
        return r;
    }
    vec2 waterCurrents(vec2 u){
    
        vec2 v = vec2(.0);
        drawCurrent(v, u, vec2(0.63, 0.01), vec2(2.53, 1.33), vec2(0., -1.)*.3);
        drawCurrent(v, u, vec2(-0.63, -0.61), vec2(2.64, 2.94), vec2(1., 0.03)*.3);
        return v;
    }
    vec4 objectsShape(vec2 u)
    {
        vec4 r = vec4(0.);
        vec2 a;

        float w = 0.05;

        float angle = -.78*2.;
        vec2 dir = sin(angle + vec2(0.,1.57));
        a = (u+vec2(-.6,-.6))*12.;
        a = a*mat2(dir ,dir .yx*vec2(-1.,1.));
        a = vec2(max(abs(a.x)-1.,0.),a.y);
        a = abs(a);
        r+= float(1.-a.y-a.x >= 0.)*myBoatsColor();

        a = (u+vec2(.6,.2))*10.;
        r+= float(1.-length(a) >= 0.)*vec4(.6,.4,.4,1.);

        return r;
    }
    vec4 mapDecorations(vec2 u)
    {
        vec4 r = terrainHeight(u)*vec4(.7,.7,.6,1.)+.3;     //color of the terrain
        r = max(r,vec4(.2,.3,.4,.0)-.1*fn(u*64.,6.3,4.));   //color of deep ocean
        finalDestDeco(u, r);
        return r;
    }
    `,
    waterQuantity: .5,
    myBoatsColor: [100,170,100,1],   //[red, green, blue, destroyable boat = 1]
                                                    //                   invincible  boat = 0
    finalDestinationCorner: [-1,-1],   //[ 1, 1] = [Top   , Right]
                                                    //[-1, 1] = [Top   ,  Left]
                                                    //[ 1,-1] = [Bottom, Right]
                                                    //[-1,-1] = [Bottom,  Left]
}
lvls[4] = {
    shaderFunctions:
    `
    float terrainHeight(vec2 u)
    {
        float r = -1.;
        float w = 0.05;
        drawLine(r, u, vec2(-0.98, -0.55), vec2(0., -0.32), w);
        drawLine(r, u, vec2(-0.69, -0.97), vec2(0.31, -0.74), w);
        drawLine(r, u, vec2(0.98, -0.43), vec2(0.64, -0.43), w);
        drawLine(r, u, vec2(0.64, -0.43), vec2(-0.04, 0.23), w);
        drawLine(r, u, vec2(-0.04, 0.23), vec2(-0.94, 0.02), w);
        drawLine(r, u, vec2(0.97, 0.06), vec2(0.97, 0.97), w);
        drawLine(r, u, vec2(0.97, 0.97), vec2(0.42, 0.97), w);
        drawLine(r, u, vec2(0.42, 0.97), vec2(0.44, 0.24), w);
        drawLine(r, u, vec2(0.44, 0.25), vec2(-0.13, 0.84), w);
        finalDestTrr(u, r);
        return r;
    }
    vec2 waterCurrents(vec2 u){
    
        vec2 v = vec2(.0);
        drawCurrent(v, u, vec2(0.63, 0.01), vec2(2.53, 1.33), vec2(0., -1.)*.3);
        drawCurrent(v, u, vec2(-0.63, -0.61), vec2(2.64, 2.94), vec2(1., 0.03)*.3);
        return v;
    }
    vec4 objectsShape(vec2 u)
    {
        vec4 r = vec4(0.);
        vec2 a;

        float w = 0.05;

        r+= drawBoat(r, u, vec2(0.75, 0.76), 7.68)*myBoatsColor();
        a = (u+vec2(0.04,-0.46))*(1./0.03);
        r+= float(1.-length(a) >= 0.)*vec4(.6,.4,.4,1.);
        a = (u+vec2(0.15,-0.33))*(1./0.03);
        r+= float(1.-length(a) >= 0.)*vec4(.6,.4,.4,1.);
        a = (u+vec2(-0.13,-0.24))*(1./0.03);
        r+= float(1.-length(a) >= 0.)*vec4(.6,.4,.4,1.);
        a = (u+vec2(-0.38,-0.3))*(1./0.03);
        r+= float(1.-length(a) >= 0.)*vec4(.6,.4,.4,1.);
        a = (u+vec2(-0.68,-0.31))*(1./0.03);
        r+= float(1.-length(a) >= 0.)*vec4(.6,.4,.4,1.);
        a = (u+vec2(-0.55,-0.1))*(1./0.03);
        r+= float(1.-length(a) >= 0.)*vec4(.6,.4,.4,1.);
        a = (u+vec2(-0.19,-0.01))*(1./0.03);
        r+= float(1.-length(a) >= 0.)*vec4(.6,.4,.4,1.);
        a = (u+vec2(0.17,-0.13))*(1./0.03);
        r+= float(1.-length(a) >= 0.)*vec4(.6,.4,.4,1.);
        a = (u+vec2(0.3,-0.59))*(1./0.03);
        r+= float(1.-length(a) >= 0.)*vec4(.6,.4,.4,1.);
        a = (u+vec2(0.44,-0.47))*(1./0.03);
        r+= float(1.-length(a) >= 0.)*vec4(.6,.4,.4,1.);
        a = (u+vec2(-0.59,0.27))*(1./0.03);
        r+= float(1.-length(a) >= 0.)*vec4(.6,.4,.4,1.);
        a = (u+vec2(-0.65,0.48))*(1./0.03);
        r+= float(1.-length(a) >= 0.)*vec4(.6,.4,.4,1.);
        a = (u+vec2(-0.34,0.67))*(1./0.03);
        r+= float(1.-length(a) >= 0.)*vec4(.6,.4,.4,1.);
        a = (u+vec2(-0.16,0.67))*(1./0.03);
        r+= float(1.-length(a) >= 0.)*vec4(.6,.4,.4,1.);
        a = (u+vec2(-0.21,0.39))*(1./0.03);
        r+= float(1.-length(a) >= 0.)*vec4(.6,.4,.4,1.);
        a = (u+vec2(0.12,0.31))*(1./0.03);
        r+= float(1.-length(a) >= 0.)*vec4(.6,.4,.4,1.);
        a = (u+vec2(0.26,0.07))*(1./0.03);
        r+= float(1.-length(a) >= 0.)*vec4(.6,.4,.4,1.);

        return r;
    }
    vec4 mapDecorations(vec2 u)
    {
        vec4 r = terrainHeight(u)*vec4(.7,.7,.6,1.)+.3;     //color of the terrain
        r = max(r,vec4(.2,.3,.4,.0)-.1*fn(u*64.,6.3,4.));   //color of deep ocean
        finalDestDeco(u, r);
        return r;
    }
    `,
    waterQuantity: .5,
    myBoatsColor: [100,170,100,1],   //[red, green, blue, destroyable boat = 1]
                                                    //                   invincible  boat = 0
    finalDestinationCorner: [-1,1],   //[ 1, 1] = [Top   , Right]
                                                    //[-1, 1] = [Top   ,  Left]
                                                    //[ 1,-1] = [Bottom, Right]
                                                    //[-1,-1] = [Bottom,  Left]
}
lvls[5] = {
    shaderFunctions: 
    `
    float terrainHeight(vec2 u)
    {
        float r = -1.;
        float w = 0.24;
        drawDonut(r, u, vec2(0.33, -0.34), 0.25, 0.63, 0.24, w);
        w = 0.1;
        drawDonut(r, u, vec2(0.31, -0.33), 0.6, 0.63, 0.24, w);
        w = 0.03;
        drawLine(r, u, vec2(0.32, -0.93), vec2(-0.75, -0.93), w);
        drawLine(r, u, vec2(-0.75, -0.59), vec2(0.34, -0.59), w);
        drawLine(r, u, vec2(0.91, -0.37), vec2(0.98, 0.7), w);
        drawLine(r, u, vec2(0.58, -0.36), vec2(0.65, 0.7), w);
        finalDestTrr(u, r);
        return r;
    }
    vec2 waterCurrents(vec2 u)
    {
        vec2 v = vec2(0.);
        return v;
    }
    vec4 objectsShape(vec2 u)
    {
        vec4 r = vec4(0.);
        vec2 a;

        a = (u+vec2(0.6,0.4))/0.1;
        r+= float(1.-length(a) >= 0.)*vec4(.7,.4,.4,1.);

        a = (u+vec2(0.8,0.75))/0.1;
        r+= float(1.-length(a) >= 0.)*myBoatsColor();

        a = (u+vec2(0.5,0.75))/0.1;
        r+= float(1.-length(a) >= 0.)*vec4(.6,.3,.6,1.);

        a = (u+vec2(0.2,0.75))/0.1;
        r+= float(1.-length(a) >= 0.)*vec4(.8,.8,.4,1.);

        a = (u+vec2(-0.1,0.75))/0.1;
        r+= float(1.-length(a) >= 0.)*myBoatsColor();

        a = (u+vec2(-0.4,0.75))/0.1;
        r+= float(1.-length(a) >= 0.)*vec4(.4,.4,.7,1.);

        r+= float(abs(u.y+.1)<.05)*vec4(.6,.3,.6,1.);
        r+= float(abs(u.y-.2)<.05)*vec4(.8,.8,.4,1.);
        r+= float(abs(u.y-.5)<.05)*vec4(.7,.4,.4,1.);

        return r;
    }
    vec4 mapDecorations(vec2 u)
    {
        vec4 r = terrainHeight(u)*vec4(.7,.7,.6,1.)+.3;     //color of the terrain
        r = max(r,vec4(.2,.3,.4,.0)-.1*fn(u*64.,6.3,4.));   //color of deep ocean
        finalDestDeco(u, r);
        return r;
    }`,
    waterQuantity: .8,
    myBoatsColor: [100,170,100,1],   //[red, green, blue, destroyable boat = 1]
                                                    //                   invincible  boat = 0
    finalDestinationCorner: [1,1],   //[ 1, 1] = [Top   , Right]
                                                    //[-1, 1] = [Top   ,  Left]
                                                    //[ 1,-1] = [Bottom, Right]
                                                    //[-1,-1] = [Bottom,  Left]
    blockers:[{w:100, h:80, l: 0, t:0}] //w, h, l, t are percentages based on the level size w= width, h=height, l=left offset, t=top offset
}
lvls[6] = {
    shaderFunctions: 
    `
    float terrainHeight(vec2 u)
    {
        float r = -1.;

        float w = 0.15;
        drawDonut(r, u, vec2(-0.13, 0.09), 0.69, 0.14, 0.24, w);
        drawDonut(r, u, vec2(-0.14, 0.1), 0.68, 0.39, 0.24, w);

        w = 0.24;
        drawDonut(r, u, vec2(-0.09, 0.12), 0.42, 0.14, 0.24, w);
        drawDonut(r, u, vec2(-0.1, 0.13), 0.41, 0.40, 0.26, w);

        w = 0.05;
        drawLine(r, u, vec2(-0.81, 0.2), vec2(-0.81, -0.3), w);
        drawLine(r, u, vec2(-0.51, 0.19), vec2(-0.52, -0.3), w);
        drawLine(r, u, vec2(0.3, 0.12), vec2(0.3, -0.29), w);
        drawLine(r, u, vec2(0.54, 0.06), vec2(0.53, -0.29), w);

        finalDestTrr(u, r);
        return r;
    }
    vec4 objectsShape(vec2 u)
    {
        vec4 r = vec4(0.);
        float w = 0.05;

        vec4 color = vec4(.8,.8,.1,1.);
        vec2 a = (u+vec2(0.14,-0.65))*(1./0.09);
        r+= float(1.-length(a) >= 0.)*vec4(.8,.8,.1,1.);

        a = (u+vec2(-0.42,0.13))*(1./0.08);
        r+= float(1.-length(a) >= 0.)*vec4(.6,.4,.4,1.);
        a = (u+vec2(-0.41,-0.22))*(1./0.06);
        r+= float(1.-length(a) >= 0.)*myBoatsColor();

        float t = .0;
        drawLine(t, u, vec2(0.3, -0.28), vec2(0.53, -0.29), w);
        r = max(r, float(t>.8)*vec4(.1, .1, .8, .5));

        drawLine(t, u, vec2(-0.81, 0.12), vec2(-0.51, 0.12), w);
        r = max(r, float(t>.8)*vec4(.1, .1, .8, .5));

        drawLine(t, u, vec2(-0.81, -0.29), vec2(-0.52, -0.29), w);
        r = max(r, float(t>.8)*vec4(.1, .1, .8, .5));

        return r;
    }
    vec2 waterCurrents(vec2 u){
        vec2 v = vec2(.0);
        return v;
    }
    vec4 mapDecorations(vec2 u)
    {
        vec4 r = terrainHeight(u)*vec4(.7,.7,.6,1.)+.3;     //color of the terrain
        r = max(r,vec4(.2,.3,.4,.0)-.1*fn(u*64.,6.3,4.));   //color of deep ocean
        finalDestDeco(u, r);
        return r;
    }`,
    waterQuantity: .8,
    myBoatsColor: [100,170,100,1],   //[red, green, blue, destroyable boat = 1]
                                                    //                   invincible  boat = 0
    finalDestinationCorner: [-1,-1],   //[ 1, 1] = [Top   , Right]
                                                    //[-1, 1] = [Top   ,  Left]
                                                    //[ 1,-1] = [Bottom, Right]
                                                    //[-1,-1] = [Bottom,  Left]
    blockers:[{w:100, h:50, l: 0, t:0},{w:50, h:50, l: 50, t:50}] //w, h, l, t are percentages based on the level size w= width, h=height, l=left offset, t=top offset
}
lvls[7] = {
    shaderFunctions: 
    `float terrainHeight(vec2 u)
    {
        float r = -1.;
        float a = .02;
        drawLine(r,u,vec2(.63,.5),vec2(.75,.63),a);
        drawLine(r,u,vec2(.75,.63),vec2(.88,.5),a);
        drawLine(r,u,vec2(.63,.75),vec2(.38,1.),a);
        drawLine(r,u,vec2(.88,.25),vec2(1.,.38),a);
        drawLine(r,u,vec2(.75,.38),vec2(.63,.25),a);
        drawLine(r,u,vec2(.63,.25),vec2(.88,0.),a);
        drawLine(r,u,vec2(.88,-.25),vec2(1.,-.12),a);
        drawLine(r,u,vec2(.5,.13),vec2(.63,0.),a);
        drawLine(r,u,vec2(.5,.13),vec2(.38,0.),a);
        drawLine(r,u,vec2(.38,0.),vec2(.5,-.12),a);
        drawLine(r,u,vec2(.75,-.12),vec2(.63,-.25),a);
        drawLine(r,u,vec2(.88,-.25),vec2(1.,-.37),a);
        drawLine(r,u,vec2(1.,-.62),vec2(1.,-.62),a);
        drawLine(r,u,vec2(.75,-.37),vec2(1.,-.62),a);
        drawLine(r,u,vec2(.75,-.37),vec2(.38,-.75),a);
        drawLine(r,u,vec2(.5,-.37),vec2(0.,.13),a);
        drawLine(r,u,vec2(-.12,0.),vec2(0.,.13),a);
        drawLine(r,u,vec2(-.12,-.25),vec2(0.,-.12),a);
        drawLine(r,u,vec2(0.,-.12),vec2(.13,-.25),a);
        drawLine(r,u,vec2(-.12,-.25),vec2(0.,-.37),a);
        drawLine(r,u,vec2(.13,-.5),vec2(.25,-.37),a);
        drawLine(r,u,vec2(.25,-.37),vec2(.38,-.5),a);
        drawLine(r,u,vec2(-.12,-.5),vec2(-.25,-.37),a);
        drawLine(r,u,vec2(-.25,-.37),vec2(-.37,-.5),a);
        drawLine(r,u,vec2(-.37,-.5),vec2(-.25,-.62),a);
        drawLine(r,u,vec2(-.5,-.37),vec2(-.62,-.5),a);
        drawLine(r,u,vec2(-.62,-.5),vec2(-.25,-.87),a);
        drawLine(r,u,vec2(-.12,-.75),vec2(0.,-.62),a);
        drawLine(r,u,vec2(.25,-.62),vec2(.13,-.75),a);
        drawLine(r,u,vec2(.13,-.75),vec2(.38,-1.),a);
        drawLine(r,u,vec2(.38,-.75),vec2(.5,-.87),a);
        drawLine(r,u,vec2(.75,-.87),vec2(.63,-1.),a);
        drawLine(r,u,vec2(.75,-.87),vec2(.88,-1.),a);
        drawLine(r,u,vec2(0.,-.87),vec2(.13,-1.),a);
        drawLine(r,u,vec2(-.5,-.87),vec2(-.37,-1.),a);
        drawLine(r,u,vec2(-.5,-.87),vec2(-.62,-1.),a);
        drawLine(r,u,vec2(-.87,-1.),vec2(-.87,-1.),a);
        drawLine(r,u,vec2(-.75,-.87),vec2(-.87,-1.),a);
        drawLine(r,u,vec2(-.87,-.75),vec2(-1.,-.62),a);
        drawLine(r,u,vec2(-.87,-.5),vec2(-.62,-.75),a);
        drawLine(r,u,vec2(-.87,-.5),vec2(-.75,-.37),a);
        drawLine(r,u,vec2(-.87,-.25),vec2(-.75,-.12),a);
        drawLine(r,u,vec2(-.75,-.12),vec2(-.62,-.25),a);
        drawLine(r,u,vec2(-.87,0.),vec2(-1.,.13),a);
        drawLine(r,u,vec2(-.5,.88),vec2(-.62,.75),a);
        drawLine(r,u,vec2(-.87,.75),vec2(-1.,.88),a);
        drawLine(r,u,vec2(-.75,.88),vec2(-.87,1.),a);
        drawLine(r,u,vec2(-.75,.63),vec2(-.87,.5),a);
        drawLine(r,u,vec2(0.,-.87),vec2(-.12,-1.),a);
        drawLine(r,u,vec2(-.12,1.),vec2(-.12,1.),a);
        drawLine(r,u,vec2(0.,.88),vec2(-.12,1.),a);
        drawLine(r,u,vec2(-.12,.75),vec2(-.25,.88),a);
        drawLine(r,u,vec2(-.25,.88),vec2(-.37,.75),a);
        drawLine(r,u,vec2(-.37,.75),vec2(-.25,.63),a);
        drawLine(r,u,vec2(.25,.88),vec2(-.12,.5),a);
        drawLine(r,u,vec2(-.5,.63),vec2(-.12,.25),a);
        drawLine(r,u,vec2(-.5,.63),vec2(-.87,.25),a);
        drawLine(r,u,vec2(-.62,0.),vec2(-.5,.13),a);
        drawLine(r,u,vec2(-.5,.13),vec2(-.25,-.12),a);
        drawLine(r,u,vec2(-.62,0.),vec2(-.37,-.25),a);
        drawLine(r,u,vec2(-.87,.25),vec2(-.75,.13),a);
        drawLine(r,u,vec2(-.75,.13),vec2(-.5,.38),a);
        drawLine(r,u,vec2(.38,.75),vec2(.38,.75),a);
        drawLine(r,u,vec2(.25,.63),vec2(.38,.75),a);
        drawLine(r,u,vec2(.38,.75),vec2(.5,.63),a);
        drawLine(r,u,vec2(.13,.5),vec2(0.,.38),a);
        drawLine(r,u,vec2(.13,.5),vec2(.38,.25),a);
        drawLine(r,u,vec2(.25,.63),vec2(.38,.5),a);
        drawLine(r,u,vec2(0.,.38),vec2(.13,.25),a);
        finalDestTrr(u, r);
        return r;
    }
    vec2 waterCurrents(vec2 u)
    {
        return vec2(.0,-.5);
    }
    vec4 objectsShape(vec2 u)
    {
        vec4 r = vec4(0.);
        vec2 a;

        a = (u-vec2(.5,-.25))*mat2(-1.,1.,1.,1.)*12.;
        a = vec2(max(abs(a.x)-2.,0.),a.y);
        r+= float(1.-dot(a,a) >= 0.)*vec4(.8,.5,.3,1.);

        a = (u-vec2(-.25,-.25))*mat2(1.,1.,-1.,1.)*20.;
        a = vec2(max(abs(a.x)-6.,0.),a.y);
        r+= float(1.-dot(a,a) >= 0.)*myBoatsColor();

        a = (u-vec2(.5,.5))*16.;
        a = abs(a)-6.;
        r+= float(1.-dot(a,a) >= 0.)*vec4(.9,.4,.4,1.);

        a = (u-vec2(-.5,.5))*16.;
        a = abs(a)-6.;
        r+= float(1.-dot(a,a) >= 0.)*vec4(.9,.4,.4,1.);

        return r;
    }
    vec4 mapDecorations(vec2 u)
    {
        vec4 r = terrainHeight(u)*vec4(.7,.7,.6,1.)+.3;     //color of the terrain
        r = max(r,vec4(.2,.3,.4,.0)-.1*fn(u*64.,6.3,4.));   //color of deep ocean
        finalDestDeco(u, r);
        return r;
    }`,
    waterQuantity: 1.,
    myBoatsColor: [100,170,100,1],   //[red, green, blue, destroyable boat = 1]
                                                    //                   invincible  boat = 0
    finalDestinationCorner: [1,1],   //[ 1, 1] = [Top   , Right]
                                                    //[-1, 1] = [Top   ,  Left]
                                                    //[ 1,-1] = [Bottom, Right]
                                                    //[-1,-1] = [Bottom,  Left]
}

lvls[8] = {
    shaderFunctions: 
    `float terrainHeight(vec2 u)
    {
        float r = -1.;
        vec2 w = u+sin(u.yx*60.)*.02;
        w = w*3.-vec2(.5,.1);

        vec2 s = vec2(1.,1.732);
        vec2 a = mod(w     ,s)*2.-s;
        vec2 b = mod(w+s*.5,s)*2.-s;
        r = 1.-min(dot(a,a),dot(b,b))*4.;

        a = (u-vec2(.49,.04))*9.;
        if(dot(a,a)<1.)
        {r = max(1.-dot(a,a),0.)*.8-max(1.-dot(a,a)*2.,0.)*.5;}

        a = (u-vec2(.16,.04))*9.;
        if(dot(a,a)<1.)
        {r = max(1.-dot(a,a),0.)*.8-max(1.-dot(a,a)*2.,0.)*.5;}

        finalDestTrr(u, r);

        return r;
    }
    vec2 waterCurrents(vec2 u)
    {
        return vec2(.0,-.5);
    }
    vec4 objectsShape(vec2 u)
    {
        vec4 r = vec4(0.);
        vec2 a;

        a = (u-vec2(.0,.0))*24.;
        a = abs(a)-12.;
        a = abs(a)-6.;
        a.x = max(abs(a.x)-1.,0.);
        r+= float(1.-dot(a,a) >= 0.)*vec4(.9,.2,.2,1.);

        a = (u-vec2(.49,.04))*20.;
        r+= float(1.-dot(a,a) >= 0.)*myBoatsColor();

        a = (u-vec2(.16,.04))*20.;
        r+= float(1.-dot(a,a) >= 0.)*vec4(.5,.2,.5,1.);

        return r;
    }
    vec4 mapDecorations(vec2 u)
    {
        vec4 r = terrainHeight(u)*vec4(.7,.7,.6,1.)+.3;     //color of the terrain
        r = max(r,vec4(.2,.3,.4,.0)-.1*fn(u*64.,6.3,4.));   //color of deep ocean
        finalDestDeco(u, r);
        return r;
    }`,
    waterQuantity: 1.,
    myBoatsColor: [100,170,100,1],   //[red, green, blue, destroyable boat = 1]
                                                    //                   invincible  boat = 0
    finalDestinationCorner: [-1,1],   //[ 1, 1] = [Top   , Right]
                                                    //[-1, 1] = [Top   ,  Left]
                                                    //[ 1,-1] = [Bottom, Right]
                                                    //[-1,-1] = [Bottom,  Left]
}
lvls[9] = {
    shaderFunctions: 
    `
    float terrainHeight(vec2 u)
    {
        float r = -1.;
        float w = 0.03;
        drawLine(r, u, vec2(-0.6, -0.6), vec2(-0.6, 0.6), w);
        drawLine(r, u, vec2(0.6, -0.6), vec2(0.6, 0.6), w);
        drawLine(r, u, vec2(-0.6, 0.6), vec2(0.6, 0.6), w);
        drawLine(r, u, vec2(-0.6, -0.6), vec2(-0.1, -0.6), w);
        drawLine(r, u, vec2(0.1, -0.6), vec2(0.6, -0.6), w);
        finalDestTrr(u, r);
        return r;
    }
    vec4 objectsShape(vec2 u)
    {
        vec4 r = vec4(0.);

        vec2 a;
        a = u*6.;
        a = abs(a)-1.1;
        a = abs(a)-1.1;
        a = abs(a);
        r+= float(1.-max(a.x,a.y) >= 0.)*vec4(.6,.4,.4,1.);

        a = u*vec2(5.8,2.8)-vec2(0.,.5);
        a = abs(a);
        r = max(r-float(1.-max(a.x,a.y) >= 0.),vec4(0.));

        a = (u+vec2(0.,-0.4))/0.05;
        r+= float(1.-length(a) >= 0.)*myBoatsColor();

        return r;
    }
    vec2 waterCurrents(vec2 u){
        vec2 v = vec2(.0);
        return v;
    }
    vec4 mapDecorations(vec2 u)
    {
        vec4 r = terrainHeight(u)*vec4(.7,.7,.6,1.)+.3;     //color of the terrain
        r = max(r,vec4(.2,.3,.4,.0)-.1*fn(u*64.,6.3,4.));   //color of deep ocean
        finalDestDeco(u, r);
        return r;
    }`,
    waterQuantity: .8,
    myBoatsColor: [100,170,100,1],   //[red, green, blue, destroyable boat = 1]
                                                    //                   invincible  boat = 0
    finalDestinationCorner: [-1,-1],   //[ 1, 1] = [Top   , Right]
                                                    //[-1, 1] = [Top   ,  Left]
                                                    //[ 1,-1] = [Bottom, Right]
                                                    //[-1,-1] = [Bottom,  Left]
}

lvls[10] = {
    shaderFunctions: 
    `float terrainHeight(vec2 u)
    {
        vec2 a = (u-vec2(.8,.8))*3.;
        float r = fn(u*9.-88.,6.3,4.)*5.-4.-max(1.-dot(a,a),0.);
        finalDestTrr(u, r);
        return r;
    }
    vec2 waterCurrents(vec2 u)
    {
        return vec2(fn(u*9.+44.,6.3,4.)-.5,
                    fn(u*9.+99.,6.3,4.)-.5)*4.;
    }
    vec4 objectsShape(vec2 u)
    {
        vec4 r = vec4(0.);
        vec2 a;

        a = (u-vec2(.5,.5))*32.;
        a = abs(a)-4.;
        a = abs(a)-2.;
        r+= float(1.-dot(a,a) >= 0.)*vec4(.9,.2,.2,1.);

        a = (u+vec2(.2,.2))*24.;
        a = abs(a)-2.5;
        r+= float(1.-dot(a,a) >= 0.)*myBoatsColor();

        return r;
    }
    vec4 mapDecorations(vec2 u)
    {
        vec4 r = terrainHeight(u)*vec4(.7,.7,.6,1.)+.3;     //color of the terrain
        r = max(r,vec4(.2,.3,.4,.0)-.1*fn(u*64.,6.3,4.));   //color of deep ocean
        finalDestDeco(u, r);
        return r;
    }`,
    waterQuantity: 1.,
    myBoatsColor: [100,170,100,1],   //[red, green, blue, destroyable boat = 1]
                                                    //                   invincible  boat = 0
    finalDestinationCorner: [1,1],   //[ 1, 1] = [Top   , Right]
                                                    //[-1, 1] = [Top   ,  Left]
                                                    //[ 1,-1] = [Bottom, Right]
                                                    //[-1,-1] = [Bottom,  Left]
}

lvls[11] = {
    shaderFunctions: 
    `float terrainHeight(vec2 u)
    {
        float r = 0.;
        vec2 a;
        r = max(hex(u*1.8)*10.-max(hex(u*2.)*16.,0.),r);

        a = (u+vec2(.0,.25))*16.;
        r = r-max(2.-dot(a,a),0.);

        finalDestTrr(u, r);

        return r;
    }
    vec2 waterCurrents(vec2 u)
    {
        return vec2(0.);
    }
    vec4 objectsShape(vec2 u)
    {
        vec4 r = vec4(0.);
        vec2 a;
        a = (u+vec2(.0,-.0))*8.;
        if(r.x==0.)r = float(hex(a) > 0.)*vec4(.4,.7,.4,0.);
        a = (u+vec2(.0,-.0))*4.;
        if(r.x==0.)r = float(hex(a) > 0.)*vec4(.6,.3,.6,1.);
        a = (u+vec2(.0,-.0))*2.5;
        if(r.x==0.)r = float(hex(a) > 0.)*vec4(.4,.6,.4,1.);
        a = (u+vec2(.0,-.0))*1.5;
        r += float(abs(hex(a)-.0)-.2 < 0.)*vec4(.4,.4,.6,1.);
        a = (u+vec2(.0,-.0))*1.5;
        r += float(abs(hex(a)+.5)-.2 < 0.)*vec4(.6,.4,.4,1.);

        a = (u+vec2(.6,.8))*8.;
        r += float(hex(a) > 0.)*vec4(.7,.4,.4,0.);
        a = (u+vec2(.2,.8))*8.;
        r += float(hex(a) > 0.)*vec4(.4,.4,.7,0.);
        a = (u+vec2(-.2,.8))*8.;
        r += float(hex(a) > 0.)*vec4(.8,.8,.4,0.);
        a = (u+vec2(-.6,.8))*8.;
        r += float(hex(a) > 0.)*vec4(.6,.3,.6,0.);

        return r;
    }
    vec4 mapDecorations(vec2 u)
    {
        vec4 r = terrainHeight(u)*vec4(.7,.7,.6,1.)+.3;     //color of the terrain
        r = max(r,vec4(.2,.3,.4,.0)-.1*fn(u*64.,6.3,4.));   //color of deep ocean
        finalDestDeco(u, r);
        return r;
    }`,
    waterQuantity: 1.,
    myBoatsColor: [100,170,100,1],  //[red, green, blue, destroyable boat = 1]
                                    //                   invincible  boat = 0
    finalDestinationCorner: [-1,1], //[ 1, 1] = [Top   , Right]
                                    //[-1, 1] = [Top   ,  Left]
                                    //[ 1,-1] = [Bottom, Right]
                                    //[-1,-1] = [Bottom,  Left]
}

lvls[12] = {
    shaderFunctions: 
    `float terrainHeight(vec2 u)
    {
        float r = -1.;
        float w = 0.03;
        //key road
        drawLine(r, u, vec2(.35,-.8), vec2(.35,-1.), w);
        drawLine(r, u, vec2(.6,-.8), vec2(.6,-1.), w);

        drawLine(r, u, vec2(.6, 1.), vec2(.6, .55), w);
        drawLine(r, u, vec2(.35, 1.), vec2(.35, .55), w);

        drawLine(r, u, vec2(-.5,.55), vec2(.35,.55), w);
        drawLine(r, u, vec2(.6,.55), vec2(1.,.55), w);
        //donut box
        drawLine(r, u, vec2(-.5,.55), vec2(-.5,.95), w);
        drawLine(r, u, vec2(-.1,.95), vec2(-1.,.95), w);

        finalDestTrr(u, r);

        return r;
    }
    vec2 waterCurrents(vec2 u)
    {
        return vec2(fn(u*16.+16.,6.3,4.),
                    fn(u*16.-16.,6.3,4.))*.8-.4;
    }
    vec4 objectsShape(vec2 u)
    {
        vec4 r = vec4(0.);
        vec2 a;
        float w = 0.015;
        float t = 0.;
        //key barrier
        w = 0.03;
        drawLine(t, u, vec2(1.,.3), vec2(-1.,.3), w);
        drawLine(t, u, vec2(.6, .3), vec2(.6, .55), w);
        if(r.x==0.)r = float(t>0.)*vec4(.8,.8,.3,.5);
        drawLine(t, u, vec2(-.5,.55), vec2(-1.,.55), w);
        if(r.x==0.)r = float(t>0.)*vec4(.7,.3,.3,.5);
        //key
        w = 0.02;
        drawLine(t, u, vec2(.72,.42), vec2(.721,.42), .05);
        drawLine(t, u, vec2(.75,.42), vec2(.85, .42), w);
        drawLine(t, u, vec2(.85,.42), vec2(.85, .45), w);
        drawLine(t, u, vec2(.8,.42), vec2(.8, .45), w);
        if(r.x==0.)r = float(t>0.)*vec4(.8,.8,.3,1.);
        //knife
        drawLine(t, u, vec2(-.29, .75), vec2(-.16, .75), .03);
        drawLine(t, u, vec2(-.2, .68), vec2(-.2, .82), w);
        drawLine(t, u, vec2(-.15, .75), vec2(.05, .75), .06);
        drawLine(t, u, vec2(.07, .79), vec2(.1, .75), w);
        drawLine(t, u, vec2(.07, .71), vec2(.1, .75), w);
        if(r.x==0.)r = float(t>0.)*vec4(.5,.2,.5,1.);
        //knife box
        drawLine(t, u, vec2(-.3, .75), vec2(.15, .75), .15);
        if(r.x==0.)r = float(t>0.)*vec4(.3,.3,.7,.5);

        //boat
        drawLine(t, u, vec2(-.75,.75), vec2(-.751,.75), .08);
        if(r.x==0.)r = float(t>0.)*vec4(.3,.7,.3,1.);
        //boat protector
        drawLine(t, u, vec2(-.75,.75),vec2(-.751,.75), .18);
        if(r.x==0.)r = float(t>0.)*vec4(.3,.3,.7,1.);

        //line killer
        drawLine(t, u, vec2(1.,-.9), vec2(1.,-.6), .4);
        if(r.x==0.)r = float(t>0.)*vec4(.7,.3,.3,.5);

        //boss hearth
        drawLine(t, u, -vec2(.4,.4), -vec2(.41,.4), .1);
        if(r.x==0.)r = float(t>0.)*vec4(.8,.8,.3,1.);
        //boss
        drawLine(t, u, -vec2(.4,.4), -vec2(.41,.4), .4);
        if(r.x==0.)r = float(t>0.)*vec4(.7,.3,.3,1.);
        drawLine(t, u, -vec2(1.,.3), -vec2(.3,1.), .1);
        if(r.x==0.)r = float(t>0.)*vec4(.7,.3,.3,.5);
        //boss hairs
        a = u+.4;
        t = sin(atan(a.x,a.y)*16.)-.5-dot(a,a);
        if(r.x==0.)r = float(t>0.)*vec4(.7,.3,.3,1.);
        //boss blue
        drawLine(t, u, -vec2(1.,.5), -vec2(.5,1.), .1);
        if(r.x==0.)r = float(t>0.)*vec4(.3,.3,.7,.5);

        t = 0.;
        drawLine(t, u, vec2(0.68, -0.98), vec2(0.68, -0.69), w);
        //r = max(r, float(t>0.)*color);
        drawLine(t, u, vec2(0.92, -0.96), vec2(0.92, -0.7), w);
        // r = max(r, float(t>0.)*color);

        drawLine(t, u, vec2(-.99, -.33), vec2(-.39, -.98), w);

        return r;
    }
    vec4 mapDecorations(vec2 u)
    {
        vec4 r = terrainHeight(u)*vec4(.7,.7,.6,1.)+.3;     //color of the terrain
        r = max(r,vec4(.2,.3,.4,.0)-.1*fn(u*64.,6.3,4.));   //color of deep ocean
        finalDestDeco(u, r);
        return r;
    }`,
    waterQuantity: .5,
    myBoatsColor: [100,170,100,1],   //[red, green, blue, destroyable boat = 1]
                                     //                   invincible  boat = 0
    finalDestinationCorner: [-1,-1],   //[ 1, 1] = [Top   , Right]
                                       //[-1, 1] = [Top   ,  Left]
                                       //[ 1,-1] = [Bottom, Right]
                                       //[-1,-1] = [Bottom,  Left]
}

// FINAL LEVEL BACAKUP
//[{"p1":{"x":503,"y":595},"p2":{"x":503,"y":508},"type":0},{"p1":{"x":577,"y":589},"p2":{"x":577,"y":509},"type":0},{"p1":{"x":485,"y":3},"p2":{"x":485,"y":89},"type":0},{"p1":{"x":485,"y":89},"p2":{"x":596,"y":88},"type":0},{"p1":{"x":4,"y":120},"p2":{"x":136,"y":120},"type":0},{"p1":{"x":136,"y":120},"p2":{"x":139,"y":3},"type":0},{"p1":{"x":139,"y":3},"p2":{"x":2,"y":3},"type":0},{"p1":{"x":3,"y":400},"p2":{"x":184,"y":593},"type":0},{"p1":{"x":405,"y":509},"p2":{"x":405,"y":595},"type":2},{"p1":{"x":476,"y":595},"p2":{"x":477,"y":511},"type":2},{"p1":{"x":478,"y":2},"p2":{"x":477,"y":212},"type":2},{"p1":{"x":477,"y":212},"p2":{"x":2,"y":214},"type":2},{"p1":{"x":4,"y":144},"p2":{"x":409,"y":143},"type":2},{"p1":{"x":408,"y":143},"p2":{"x":408,"y":3},"type":2},{"p1":{"x":524,"y":210},"p2":{"x":523,"y":138},"type":2},{"p1":{"x":523,"y":138},"p2":{"x":596,"y":138},"type":2},{"p1":{"x":525,"y":209},"p2":{"x":594,"y":209},"type":2},{"p1":{"x":78,"y":65},"radius":42,"rotation":0,"gap":0.3,"type":3},{"p1":{"x":179,"y":22},"p2":{"x":179,"y":109},"type":2},{"p1":{"x":179,"y":109},"p2":{"x":369,"y":107},"type":2},{"p1":{"x":369,"y":107},"p2":{"x":370,"y":19},"type":2},{"p1":{"x":370,"y":19},"p2":{"x":178,"y":22},"type":2},{"p1":{"x":214,"y":68},"p2":{"x":252,"y":68},"type":0},{"p1":{"x":251,"y":87},"p2":{"x":251,"y":47},"type":0},{"p1":{"x":251,"y":68},"p2":{"x":323,"y":68},"type":0},{"p1":{"x":322,"y":55},"p2":{"x":333,"y":68},"type":0},{"p1":{"x":333,"y":68},"p2":{"x":323,"y":81},"type":0},{"p1":{"x":547,"y":175},"radius":12,"type":1},{"p1":{"x":556,"y":177},"p2":{"x":586,"y":177},"type":0},{"p1":{"x":586,"y":177},"p2":{"x":586,"y":165},"type":0},{"p1":{"x":577,"y":177},"p2":{"x":577,"y":165},"type":0}]

export default lvls;
