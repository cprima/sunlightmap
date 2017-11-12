package sunlightmap

import (
	"fmt"
	"math"
)

type vec3 struct {
	x float64
	y float64
	z float64
}

func (v vec3) dot(v2 vec3) float64 {
	return (v.x * v2.x) + (v.y * v2.y) + (v.z * v2.z)
}

func (v *vec3) normalize(to float64) (err error) {
	if v.length() == 0 {
		return fmt.Errorf("cannot normalize to 0")
	}
	if to == 0 {
		to = 1
	}
	var invLength = to / v.length()
	v.x = v.x * invLength
	v.y = v.y * invLength
	v.z = v.z * invLength
	return nil
}

func (v vec3) lengthSquared() float64 {
	return math.Pow(v.x, 2) + math.Pow(v.y, 2) + math.Pow(v.z, 2)
}

func (v vec3) length() float64 {
	return math.Sqrt(v.lengthSquared())
}
