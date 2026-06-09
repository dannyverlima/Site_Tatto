import hero from "../../tela de inicio.png";
import img2 from "../../2.png";
import img3 from "../../3.png";
import img4 from "../../4.png";
import img5 from "../../5.png";
import img6 from "../../6.png";
import img7 from "../../7.png";
import img8 from "../../8.png";
import img9 from "../../9.png";
import img10 from "../../10.png";

export default function App() {
  return (
    <div className="w-full">
      {[hero, img2, img3, img4, img5, img6, img7, img8, img9, img10].map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Seção ${i + 1}`}
          className="w-full block"
          style={{ display: "block" }}
        />
      ))}
    </div>
  );
}
