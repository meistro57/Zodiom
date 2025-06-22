import { Body, HelioVector, RotateVector, Rotation_EQJ_ECL } from 'astronomy-engine';

export default function createPluto(toi) {
  return {
    async getHeliocentricEclipticRectangularJ2000Coordinates() {
      const date = toi.getDate ? toi.getDate() : toi;
      const eq = HelioVector(Body.Pluto, date);
      const ecl = RotateVector(Rotation_EQJ_ECL(), eq);
      return { x: ecl.x, y: ecl.y, z: ecl.z };
    }
  };
}
