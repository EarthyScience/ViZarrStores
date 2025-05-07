uniform sampler3D dataArray;
uniform sampler3D dataArray2;
uniform int axis;
uniform int axisSize;
uniform vec2 resolution;


void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 sampleCoord;
    
    if (axis == 0) {
        sampleCoord = vec3(uv.x, uv.y, 0.0);
    } else if (axis == 1) {
        sampleCoord = vec3(uv.x, 0.0, uv.y);
    } else if (axis == 2) {
        sampleCoord = vec3(0.0, uv.x, uv.y);
    }

    float sumX = 0.0;
    float sumY = 0.0;
    float sumXX = 0.0;
    float sumYY = 0.0;
    float sumXY = 0.0;

    for (int m = 0; m < axisSize; m++) {
        float coord = (float(m) + 0.5) / float(axisSize);
        if (axis == 0) {
            sampleCoord.z = coord;
        } else if (axis == 1) {
            sampleCoord.y = coord;
        } else if (axis == 2) {
            sampleCoord.x = coord;
        }
        float X_i = texture(dataArray, sampleCoord).r;
        float Y_i = texture(dataArray2, sampleCoord).r;
        sumX += X_i;
        sumY += Y_i;
        sumXX += X_i * X_i;
        sumYY += Y_i * Y_i;
        sumXY += X_i * Y_i;
    }

    float N = float(axisSize);
    float meanX = sumX / N;
    float meanY = sumY / N;
    float varX = (sumXX / N) - (meanX * meanX);
    float varY = (sumYY / N) - (meanY * meanY);
    float covXY = (sumXY / N) - (meanX * meanY);
    float sigmaX = sqrt(max(0.0, varX));
    float sigmaY = sqrt(max(0.0, varY));
    float epsilon = 1e-6;
    float denominator = sigmaX * sigmaY + epsilon;
    float correlation = covXY / denominator;

    gl_FragColor = vec4(correlation, 0.0, 0.0, 1.0);
    
}