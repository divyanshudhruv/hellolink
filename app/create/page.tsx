import "./../../styles/create.css";

export default function Create() {
  return (
    <>
      <div className="container">
        <div className="box">
          <div className="textBig">Onboarding</div>
          <div className="input">divyanshudhruv</div>
          <input
            type="password"
            required
            spellCheck={false}
            placeholder="Enter password"
          />
          <div className="buttonC">
            {" "}
            <div className="button2">Create link</div>
          </div>
        </div>
      </div>
    </>
  );
}
