export default function ShuffleArray(datos: string[]) {
    // Copia para evitar mutar el arreglo original (buena práctica)
    const result = [...datos];

    for (let i = result.length - 1; i > 0; i--) {
      // Generar un índice aleatorio entre 0 e i
      const j = Math.floor(Math.random() * (i + 1));

      // Intercambiar los elementos result[i] y result[j]
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }