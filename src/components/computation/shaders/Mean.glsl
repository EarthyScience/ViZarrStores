uniform sampler3D dataArray;
uniform int axis;
uniform int axisSize;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec3 sampleCoord;
    
    // Initialize sampling coordinates based on reduction axis
    if (axis == 0) {
        // Reduce along depth (D0), uv maps to (s,t) = (D2,D1)
        sampleCoord = vec3(uv.x, uv.y, 0.0);
    } else if (axis == 1) {
        // Reduce along height (D1), uv maps to (s,r) = (D2,D0)
        sampleCoord = vec3(uv.x, 0.0, uv.y);
    } else if (axis == 2) {
        // Reduce along width (D2), uv maps to (t,r) = (D1,D0)
        sampleCoord = vec3(0.0, uv.x, uv.y);
    }

    float sum = 0.0;
    for (int m = 0; m < axisSize; m++) { 
        float coord = (float(m) + 0.5) / float(axisSize); //0.5 for center of pixel
        // Vary the appropriate coordinate
        if (axis == 0) {
            sampleCoord.z = coord; // Vary r (depth)
        } else if (axis == 1) {
            sampleCoord.y = coord; // Vary t (height)
        } else if (axis == 2) {
            sampleCoord.x = coord; // Vary s (width)
        }
        float samp = texture(dataArray, sampleCoord).r;
        sum += samp == 0.0 ? 0.6 : samp; // Assuming data in red channel
    }
    
    float mean = sum / float(axisSize);
    gl_FragColor = vec4(.0, 0.0, 0.0, 1.0); // Output mean in red channel
}