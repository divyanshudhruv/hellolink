"use client";

import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import "./create.css";
import "./../../../styles/errorPage.css";
import {
  Codepen,
  Download,
  Dribbble,
  Github,
  Linkedin,
  LogOut,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Avvvatars from "avvvatars-react";
import { supabase } from "@/config/supabase";
import { Toaster } from "sonner";
import { toast } from "sonner";

export default function CreateProfile() {
  const [githubFinal, setGithubFinal] = useState("");
  const [dribbbleFinal, setDribbbleFinal] = useState("");
  const [linkedinFinal, setLinkedinFinal] = useState("");
  const [codepenFinal, setCodepenFinal] = useState("");
  const [github, setGithub] = useState(githubFinal || "");
  const [dribbble, setDribbble] = useState(dribbbleFinal || "");
  const [linkedin, setLinkedin] = useState(linkedinFinal || "");
  const [codepen, setCodepen] = useState(codepenFinal || "");

  const { username } = useParams();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userData, setUserData] = useState({
    id: "",
    uid: "",
    name: "",
    bio: "",
  });

  const [links, setLinks] = useState<LinkEntry[]>([]);
  const [idCounter, setIdCounter] = useState(1);
  const [bio, setBio] = useState(userData?.bio || "");
  useEffect(() => {
    async function fetchUserData() {
      if (typeof username !== "string") {
        console.error("Invalid username parameter");
        return;
      }
      const userId = await getCurrentUserId();
      const userDetails = await getUserDetails(username);

      setUserData({
        id: userId || "",
        uid: userDetails?.uid || "",
        name: userDetails?.name || "",
        bio: userDetails?.bio || "",
      });

      if (userDetails?.uid === userId) {
        setIsAuthorized(true);
        fetchLinks(userDetails.uid);
      }
    }
    fetchUserData();
  }, [username]);

  async function getCurrentUserId() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) console.error("Error fetching session:", error);
    return session?.user?.id || null;
  }

  interface UserDetails {
    uid: string;
    name: string;
    bio: string;
    links?: { [key: string]: { url: string } };
  }

  async function getUserDetails(username: string): Promise<UserDetails | null> {
    const { data, error } = await supabase
      .from("users")
      .select("uid, name, bio, links")
      .eq("id", username)
      .single();

    if (error) {
      console.error("Error fetching user details:", error);
      return null;
    }
    return data;
  }

  interface LinkEntry {
    id: number;
    name: string;
    url: string;
  }
  const saveLinksToSupabase = async () => {
    if (!userData.uid) return;

    const formattedLinks = links
      .filter(({ name, url }) => name.trim() && url.trim()) // Ensure valid entries
      .map(({ name, url }) => ({ name, url })); // Store as an ordered array

    const { error } = await supabase
      .from("users")
      .update({ links: formattedLinks }) // Save as an ordered array
      .eq("uid", userData.uid);

    if (error) console.error("Error saving links:", error);
    else {
      // console.log("Links saved successfully:", formattedLinks);
      toast("Links saved successfully", {
        description: `url: hellolink/${userData.name}`,
        action: {
          label: "Okay",
          onClick: () => console.log("Undo"),
        },
      });
    }
  };

  async function fetchLinks(uid: string) {
    const { data, error } = await supabase
      .from("users")
      .select("links")
      .eq("uid", uid)
      .single();

    if (error) {
      console.error("Error fetching links:", error);
      return;
    }

    // Ensure links are loaded in the same order
    const savedLinks = Array.isArray(data?.links)
      ? data.links.map((link, index) => ({ id: index + 1, ...link }))
      : [];

    setLinks(savedLinks);
    setIdCounter(savedLinks.length + 1);
  }

  const addLink = () => {
    setLinks([...links, { id: idCounter, name: "", url: "" }]);
    setIdCounter((prev) => prev + 1);
  };

  const updateLink = (id: number, name: string, url: string) => {
    setLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, name, url } : link))
    );
  };

  const removeLink = (id: number) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));
  };

  function UserNotFound() {
    useEffect(() => {
      const timer = setTimeout(() => {
        setShowNotFound(true);
      }, 3000);
      return () => clearTimeout(timer);
    }, []);

    const [showNotFound, setShowNotFound] = useState(false);

    return showNotFound ? <>USER NOT FOUND ;-;</> : null;
  }

  if (!isAuthorized)
    return (
      <>
        <div className="error">
          Loading(checking auth)...
          <br />
          <UserNotFound />
        </div>
      </>
    );

  async function saveBio() {
    if (!userData.uid) return;
    const { error } = await supabase
      .from("users")
      .update({ bio })
      .eq("uid", userData.uid);

    if (error) console.error("Error saving bio:", error);
    else {
      // console.log("Bio saved successfully:", bio);
      toast("Bio saved successfully", {
        description: `Database updated for ${userData.name}`,
        action: {
          label: "Okay",
          onClick: () => console.log("Undo"),
        },
      });
    }
  }

  async function saveSocials() {
    if (!userData?.uid) {
      console.error("User UID not found.");
      return;
    }

    const socialsJSON = {
      github: github,
      dribbble: dribbble,
      linkedin: linkedin,
      codepen: codepen,
    };

    const { error } = await supabase
      .from("users")
      .update({ socials: socialsJSON }) // ✅ Now saving as JSON, not a string
      .eq("uid", userData.uid); // ✅ Ensure correct user is updated

    if (error) {
      console.error("Error saving socials:", error);
    } else {
      toast("Social links saved successfully", {
        description: `Database updated for ${userData.name}`,
        action: {
          label: "Okay",
          onClick: () => console.log("Undo"),
        },
      });
    }
  }

  async function fetchSocials() {
    if (!userData?.uid) {
      console.error("User UID not found.");
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("socials")
      .eq("uid", userData.uid)
      .single();

    if (error) {
      console.error("Error fetching socials:", error);
    } else if (data?.socials) {
      // Extract values and set them to state variables
      setGithubFinal(data.socials.github || "");
      setDribbbleFinal(data.socials.dribbble || "");
      setLinkedinFinal(data.socials.linkedin || "");
      setCodepenFinal(data.socials.codepen || "");
    }
  }

  async function logOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
    } else {
      console.log("User logged out successfully.");
      window.location.href = "/"; // Redirect to home or login page
    }
  }

  fetchSocials();
  // ✅ Dependency added to re-run when userData.uid changes
  return (
    <>
      {" "}
      <Toaster />
      <div className="home">
        <div className="nav">
          <div
            className="textBig"
            onClick={() => (window.location.href = "/")}
            onKeyDown={() => {}}
            role="button"
            tabIndex={0}
          >
            hellolink
          </div>
          <div
            className="buttonLogout"
            onClick={logOut}
            onKeyDown={() => {}}
            role="button"
            tabIndex={0}
          >
            <LogOut />
          </div>
          <div
            className="button"
            onClick={() => window.open(`/${userData.name}`, "_blank")}
            onKeyDown={() => {}}
            role="button"
            tabIndex={0}
          >
            View live
          </div>
        </div>
        <div className="main">
          <div className="top">
            <div className="pfp">
              {" "}
              <Avvvatars
                value="devvve235224wqqwrtete"
                style="shape"
                size={100}
              />
            </div>
            <div className="name">@{userData.name}</div>
            <div className="bio">
              {userData.bio || "Write a short bio about yourself."}
              <Dialog>
                <DialogTrigger asChild>
                  <div className="editButton">_E</div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit bio</DialogTitle>
                    <DialogDescription>
                      Make changes to your bio here. Click save when you&apos;re
                      done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="min-w-full min-h-fit">
                      <Textarea
                        placeholder="Enter your bio..."
                        onChange={(e) => {
                          setUserData((prev) => ({
                            ...prev,
                            bio: e.target.value,
                          }));
                          setBio(e.target.value);
                        }}
                        id="textArea"
                        value={userData.bio ?? ""} // Ensure it's not undefined
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogTrigger asChild>
                      <Button
                        onClick={saveBio}
                        onKeyDown={() => {}}
                        role="button"
                        tabIndex={0}
                      >
                        Save changes
                      </Button>
                    </DialogTrigger>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="socials">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="item">
                    <Github />
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit your social links</DialogTitle>
                    <DialogDescription>
                      Make changes to your social links here. Click save when
                      you&apos;re done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="min-w-full min-h-fit">
                      <Label>Github</Label>
                      <Input
                        placeholder="Enter GitHub URL"
                        id="github"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)} // ✅ No cursor reset
                        spellCheck={false}
                      />
                      <div
                        style={{
                          display: "flex",
                          height: "10px",
                          width: "100%",
                        }}
                      />

                      <Label>Dribbble</Label>
                      <Input
                        placeholder="Enter Dribbble URL"
                        id="dribbble"
                        spellCheck={false}
                        value={dribbble}
                        onChange={(e) => setDribbble(e.target.value)}
                      />
                      <div
                        style={{
                          display: "flex",
                          height: "10px",
                          width: "100%",
                        }}
                      />

                      <Label>LinkedIn</Label>
                      <Input
                        placeholder="Enter LinkedIn URL"
                        spellCheck={false}
                        id="linkedin"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                      />
                      <div
                        style={{
                          display: "flex",
                          height: "10px",
                          width: "100%",
                        }}
                      />

                      <Label>CodePen</Label>
                      <Input
                        placeholder="Enter CodePen URL"
                        spellCheck={false}
                        id="codepen"
                        value={codepen}
                        onChange={(e) => setCodepen(e.target.value)}
                      />
                    </div>
                  </div>{" "}
                  <Label>✕ Enter all the links one time only</Label>
                  <DialogFooter>
                    <DialogTrigger asChild>
                      <Button
                        onClick={saveSocials}
                        onKeyDown={() => {}}
                        role="button"
                        tabIndex={0}
                      >
                        Save changes
                      </Button>
                    </DialogTrigger>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <div className="item">
                    <Dribbble />
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit your social links</DialogTitle>
                    <DialogDescription>
                      Make changes to your social links here. Click save when
                      you&apos;re done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="min-w-full min-h-fit">
                      <Label>Github</Label>
                      <Input
                        placeholder="Enter GitHub URL"
                        id="github"
                        spellCheck={false}
                        value={github}
                        onChange={(e) => setGithub(e.target.value)} // ✅ No cursor reset
                      />
                      <div
                        style={{
                          display: "flex",
                          height: "10px",
                          width: "100%",
                        }}
                      />

                      <Label>Dribbble</Label>
                      <Input
                        placeholder="Enter Dribbble URL"
                        spellCheck={false}
                        id="dribbble"
                        value={dribbble}
                        onChange={(e) => setDribbble(e.target.value)}
                      />
                      <div
                        style={{
                          display: "flex",
                          height: "10px",
                          width: "100%",
                        }}
                      />

                      <Label>LinkedIn</Label>
                      <Input
                        placeholder="Enter LinkedIn URL"
                        spellCheck={false}
                        id="linkedin"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                      />
                      <div
                        style={{
                          display: "flex",
                          height: "10px",
                          width: "100%",
                        }}
                      />

                      <Label>CodePen</Label>
                      <Input
                        placeholder="Enter CodePen URL"
                        id="codepen"
                        value={codepen}
                        spellCheck={false}
                        onChange={(e) => setCodepen(e.target.value)}
                      />
                    </div>
                  </div>
                  <Label>✕ Enter all the links one time only</Label>
                  <DialogFooter>
                    <DialogTrigger asChild>
                      <Button
                        onClick={saveSocials}
                        onKeyDown={() => {}}
                        role="button"
                        tabIndex={0}
                      >
                        Save changes
                      </Button>
                    </DialogTrigger>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <div className="item">
                    <Linkedin />
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit your social links</DialogTitle>
                    <DialogDescription>
                      Make changes to your social links here. Click save when
                      you&apos;re done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="min-w-full min-h-fit">
                      <Label>Github</Label>
                      <Input
                        spellCheck={false}
                        placeholder="Enter GitHub URL"
                        id="github"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)} // ✅ No cursor reset
                      />
                      <div
                        style={{
                          display: "flex",
                          height: "10px",
                          width: "100%",
                        }}
                      />

                      <Label>Dribbble</Label>
                      <Input
                        placeholder="Enter Dribbble URL"
                        id="dribbble"
                        spellCheck={false}
                        value={dribbble}
                        onChange={(e) => setDribbble(e.target.value)}
                      />
                      <div
                        style={{
                          display: "flex",
                          height: "10px",
                          width: "100%",
                        }}
                      />

                      <Label>LinkedIn</Label>
                      <Input
                        spellCheck={false}
                        placeholder="Enter LinkedIn URL"
                        id="linkedin"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                      />
                      <div
                        style={{
                          display: "flex",
                          height: "10px",
                          width: "100%",
                        }}
                      />

                      <Label>CodePen</Label>
                      <Input
                        placeholder="Enter CodePen URL"
                        id="codepen"
                        spellCheck={false}
                        value={codepen}
                        onChange={(e) => setCodepen(e.target.value)}
                      />
                    </div>
                  </div>
                  <Label>✕ Enter all the links one time only</Label>
                  <DialogFooter>
                    <DialogTrigger asChild>
                      <Button
                        onClick={saveSocials}
                        onKeyDown={() => {}}
                        role="button"
                        tabIndex={0}
                      >
                        Save changes
                      </Button>
                    </DialogTrigger>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <div className="item">
                    <Codepen />
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit your social links</DialogTitle>
                    <DialogDescription>
                      Make changes to your social links here. Click save when
                      you&apos;re done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="min-w-full min-h-fit">
                      <Label>Github</Label>
                      <Input
                        placeholder="Enter GitHub URL"
                        id="github"
                        spellCheck={false}
                        value={github}
                        onChange={(e) => setGithub(e.target.value)} // ✅ No cursor reset
                      />
                      <div
                        style={{
                          display: "flex",
                          height: "10px",
                          width: "100%",
                        }}
                      />

                      <Label>Dribbble</Label>
                      <Input
                        placeholder="Enter Dribbble URL"
                        id="dribbble"
                        spellCheck={false}
                        value={dribbble}
                        onChange={(e) => setDribbble(e.target.value)}
                      />
                      <div
                        style={{
                          display: "flex",
                          height: "10px",
                          width: "100%",
                        }}
                      />

                      <Label>LinkedIn</Label>
                      <Input
                        placeholder="Enter LinkedIn URL"
                        id="linkedin"
                        value={linkedin}
                        spellCheck={false}
                        onChange={(e) => setLinkedin(e.target.value)}
                      />
                      <div
                        style={{
                          display: "flex",
                          height: "10px",
                          width: "100%",
                        }}
                      />

                      <Label>CodePen</Label>
                      <Input
                        placeholder="Enter CodePen URL"
                        id="codepen"
                        value={codepen}
                        onChange={(e) => setCodepen(e.target.value)}
                        spellCheck={false}
                      />
                    </div>
                  </div>
                  <Label>✕ Enter all the links one time only</Label>
                  <DialogFooter>
                    <DialogTrigger asChild>
                      <Button
                        onClick={saveSocials}
                        onKeyDown={() => {}}
                        role="button"
                        tabIndex={0}
                      >
                        Save changes
                      </Button>
                    </DialogTrigger>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="bottom">
            <div className="textTop">Featured Links</div>
            <div className="linkC">
              <div
                className="linkContainer"
                style={{
                  width: "100%",
                  gap: "20px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {links.map((link) => (
                  <DynamicLink
                    key={link.id}
                    link={link}
                    updateLink={updateLink}
                    removeLink={removeLink}
                  />
                ))}
              </div>
              <div
                className="addLink"
                onClick={addLink}
                onKeyDown={() => {}}
                role="button"
                tabIndex={0}
              >
                <Plus size={32} />
              </div>
              <div
                className="saveLink"
                onClick={saveLinksToSupabase}
                onKeyDown={() => {}}
                role="button"
                tabIndex={0}
              >
                <Download size={32} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function DynamicLink({
  link,
  updateLink,
  removeLink,
}: {
  link: { id: number; name: string; url: string };
  updateLink: (id: number, name: string, url: string) => void;
  removeLink: (id: number) => void;
}) {
  const logoRef = useRef<number | null>(null);
  const [logoValue, setLogoValue] = useState(link.name || "410dev");

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    updateLink(link.id, link.name, newUrl);

    if (logoRef.current) clearTimeout(logoRef.current);
    logoRef.current = window.setTimeout(() => setLogoValue(newUrl), 500);
  };

  return (
    <div className="link">
      <div className="logo">
        <Avvvatars value={logoValue} style="shape" size={55} />
      </div>
      <div className="input">
        <input
          type="text"
          placeholder="Name"
          value={link.name}
          onChange={(e) => updateLink(link.id, e.target.value, link.url)}
          spellCheck={false}
        />
        <div className="separator"></div>
        <input
          type="text"
          placeholder="Link"
          value={link.url}
          onChange={handleUrlChange}
          spellCheck={false}
        />
      </div>
      <div
        className="enter"
        onClick={() => removeLink(link.id)}
        onKeyDown={() => {}}
        role="button"
        tabIndex={0}
      >
        <Trash2 size={26} />
      </div>
    </div>
  );
}
