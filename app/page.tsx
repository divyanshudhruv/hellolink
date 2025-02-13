import Image from "next/image";
import "./style.css";
import Avvvatars from "avvvatars-react";
// import { DribbbleIcon } from "@/components/ui/dribbble";
// import { TwitchIcon } from "@/components/ui/twitch";
// import { LinkedinIcon } from "@/components/ui/linkedin";
// import { YoutubeIcon } from "@/components/ui/youtube";
import { InstagramIcon } from "@/components/ui/instagram";
import {
  ArrowRight,
  Github,
  LucideGithub,
  MailPlus,
  ShieldCheckIcon,
} from "lucide-react";

export default function Home() {
  return (
    <>
      <div className="container">
        <div className="nav">
          <div className="leftC">
            <div className="logo">
              {" "}
              <Avvvatars
                style="shape"
                value="hello 32link124567153fgdfy35ey"
                size={60}
              />
            </div>
            <div className="linkContainer">
              <div className="link">Home</div>
              <div className="link">Create</div>
              <div className="link">Dashboard</div>
              <div className="link">Contribute</div>
            </div>
          </div>
          <div className="rightC">
            {" "}
            <div className="buttonContainer">
              <div className="button">Try it out</div>
            </div>
          </div>
        </div>
        <div className="home">
          <div className="textBig">hellolink</div>
          <div className="textSmall">
            Tired of messy bios? Say hello to a single, powerful link that
            organizes and shares everything you love in one place.{" "}
          </div>
          <a href="#signup"><div className="button">Explore all</div></a>
        </div>
        <div className="feature">
          <div className="box">
            <div className="top">
              <div className="code1">hellolink/username</div>
            </div>
            <div className="bottom">
              Get a short, shareable link for a clean online identity.
            </div>
          </div>
          <div className="box">
            {" "}
            <div className="top">
              <div className="containerFull">
                <div className="code">
                  <div className="line"></div>
                </div>
                <div className="code">
                  <div className="line"></div>
                </div>
                <div className="code">
                  <div className="line"></div>
                </div>
              </div>
            </div>
            <div className="bottom">
              One sleek layout that adapts beautifully to all users.
            </div>
          </div>
          <div className="box">
            {" "}
            <div className="top">
              <div className="containerFull">
                <div className="instagramSquare">
                  <div className="icon">
                    <InstagramIcon />
                  </div>
                  <div className="text1"></div>
                  <div className="text2"></div>
                </div>
              </div>
            </div>
            <div className="bottom">
              Add instant actions for WhatsApp, email, or DMs.
            </div>
          </div>
        </div>
<div id="signup"></div>
        <div className="signup">
          <div className="left">
            <div className="box">
              <div className="textTop">Sign up and share!</div>
              <div className="textBottom">
                Join HelloLink and create your personalized link page in
                seconds. Share all your important links with a single, sleek
                profile. Sign up now—it's quick, easy, and free!
              </div>
            </div>
          </div>
          <div className="right">
            <div className="box">
              <div className="header">
                <div className="pfp"></div>
                <div className="text">hellolink/divyanshudhruv</div>
              </div>
              <input type="text" placeholder="username" id="username" />
              <input type="email" placeholder="e-mail" id="e-mail" />
              <div className="buttonSignUp">
                Sign up&nbsp;&nbsp;
                <ArrowRight size={23} />
              </div>
            </div>
          </div>
        </div>
        <div className="footer">
          <div className="left">
            <div className="top">
              <div className="textTop">hellolink</div>
              <div className="buttonC">
              <a href="#signup"><div className="button1">Try now</div></a>
                <div className="button2">
                  {" "}
                  <a
                    href="https://github.com/divyanshudhruv/hellolink"
                    target="_blank"
                  >
                    Contribute
                  </a>
                </div>
              </div>
            </div>
            
          </div>
          <div className="right">
            <div className="box">© 2025 HelloLink. All rights reserved.</div>
          </div>
        </div>
        <div className="lastLine">
          made with bugs by{" "}
          <u>
            <a href="https://github.com/divyanshudhruv" target="_blank">
              @divyanshudhruv
            </a>
          </u>
        </div>
      </div>
    </>
  );
}
