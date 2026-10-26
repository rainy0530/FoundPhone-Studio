import { useState, type ComponentType } from "react";
import {
  Plane,
  Wifi,
  Bluetooth,
  Signal,
  Battery,
  Settings,
  Accessibility,
  Image,
  Bell,
  Volume2,
  Moon,
  Shield,
  ChevronRight,
  Search,
  Check,
  Link,
  Globe,
  Mic,
} from "lucide-react";
import type { Work, Item } from "../schema";
import { IOSToggle } from "../vendor/konsta/Toggle";
import { NavigationPage, useNavigation } from "./Navigation";
type Row = [ComponentType<{ size?: number }>, string, string];
const groups: Row[][] = [
  [
    [Plane, "飞行模式", "#ff9500"],
    [Wifi, "无线局域网", "#007aff"],
    [Bluetooth, "蓝牙", "#007aff"],
    [Signal, "蜂窝网络", "#34c759"],
    [Link, "个人热点", "#65ce88"],
    [Battery, "电池", "#34c759"],
    [Globe, "VPN", "#007aff"],
  ],
  [
    [Settings, "通用", "#8e8e93"],
    [Accessibility, "辅助功能", "#007aff"],
    [Image, "墙纸", "#32ade6"],
  ],
  [
    [Bell, "通知", "#ff3b30"],
    [Volume2, "声音与触感", "#ff2d55"],
    [Moon, "专注模式", "#5856d6"],
    [Shield, "面容 ID 与密码", "#34c759"],
  ],
];
export function NativeSettings({
  work,
  items,
  creator,
  onItem,
  onSettings,
}: {
  work: Work;
  items: Item[];
  creator: boolean;
  onItem: (i: Item) => void;
  onSettings?: () => void;
}) {
  const nav = useNavigation(),
    [query, setQuery] = useState(""),
    [airplane, setAirplane] = useState(false),
    [wifi, setWifi] = useState(true),
    [bluetooth, setBluetooth] = useState(true),
    [lowPower, setLowPower] = useState(false),
    [lockWallpaper, setLockWallpaper] = useState(() => {
      try { return localStorage.getItem("foundphone-lock-wallpaper") || import.meta.env.BASE_URL + "assets/wallpapers/jaehyun-lock.jpeg"; } catch { return import.meta.env.BASE_URL + "assets/wallpapers/jaehyun-lock.jpeg"; }
    }),
    [homeWallpaper, setHomeWallpaper] = useState(() => {
      try { return localStorage.getItem("foundphone-home-wallpaper") || import.meta.env.BASE_URL + "assets/wallpapers/jaehyun-home.jpeg"; } catch { return import.meta.env.BASE_URL + "assets/wallpapers/jaehyun-home.jpeg"; }
    }),
    [wallpaperError, setWallpaperError] = useState("");

  const chooseWallpaper = async (kind: "lock" | "home", file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setWallpaperError("请选择图片文件。");
      return;
    }
    try {
      const source = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("无法读取图片"));
        reader.onerror = () => reject(new Error("读取图片失败"));
        reader.readAsDataURL(file);
      });
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("无法识别这张图片，请尝试 JPG 或 PNG 格式"));
        img.src = source;
      });
      const scale = Math.min(1, 1400 / image.width, 2400 / image.height);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("图片处理失败");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL("image/jpeg", 0.82);
      const key = kind === "lock" ? "foundphone-lock-wallpaper" : "foundphone-home-wallpaper";
      try {
        localStorage.setItem(key, data);
      } catch {
        throw new Error("图片仍然太大，请选择较小的照片后重试。");
      }
      if (kind === "lock") setLockWallpaper(data);
      else setHomeWallpaper(data);
      window.dispatchEvent(new CustomEvent("foundphone-wallpaper-change"));
      setWallpaperError("");
    } catch (error) {
      setWallpaperError(error instanceof Error ? error.message : "设置壁纸失败，请重试。");
    }
  };
  const clearWallpaper = (kind: "lock" | "home") => {
    const key = kind === "lock" ? "foundphone-lock-wallpaper" : "foundphone-home-wallpaper";
    try { localStorage.removeItem(key); } catch { setWallpaperError("浏览器无法清除已保存的壁纸。"); }
    if (kind === "lock") setLockWallpaper(import.meta.env.BASE_URL + "assets/wallpapers/jaehyun-lock.jpeg");
    else setHomeWallpaper(import.meta.env.BASE_URL + "assets/wallpapers/jaehyun-home.jpeg");
    window.dispatchEvent(new CustomEvent("foundphone-wallpaper-change"));
    setWallpaperError("");
  };
  const row = (label: string, value?: string, click?: () => void) => (
    <button key={label} className="settings-native-row" onClick={click}>
      <span>{label}</span>
      <span className="settings-detail-value">{value}</span>
      {click && <ChevronRight size={16} />}
    </button>
  );
  const toggle = (label: string, value: boolean, set: (v: boolean) => void) => (
    <div className="settings-native-row">
      <span>{label}</span>
      <IOSToggle label={label} checked={value} onChange={set} />
    </div>
  );
  const sub = () => {
    switch (nav.page) {
      case "通用":
        return (
          <div className="settings-group">
            {row("关于本机", "", () => nav.push("关于本机"))}
            {row("软件更新", "iOS 18.0", () => nav.push("软件更新"))}
            {row("iPhone 储存空间", "", () => nav.push("iPhone 储存空间"))}
            {row("日期与时间", "", () => nav.push("日期与时间"))}
            {row("语言与地区", "简体中文", () => nav.push("语言与地区"))}
          </div>
        );
      case "关于本机":
        return (
          <div className="settings-group">
            {row("名称", work.phone.owner + "的 iPhone")}
            {row("iOS 版本", "18.0")}
            {row("机型名称", "iPhone 15 Pro")}
            {row("照片", String(work.data.photos?.length || 0))}
            {row(
              "应用程序",
              String(work.apps.filter((a) => a.installed).length),
            )}
          </div>
        );
      case "Wi-Fi":
      case "无线局域网":
        return (
          <>
            <div className="settings-group">
              {toggle("Wi-Fi", wifi, setWifi)}
            </div>
            {wifi && (
              <>
                <p className="settings-section-label">我的网络</p>
                <div className="settings-group">
                  <div className="settings-native-row">
                    <Check size={18} color="#007aff" />
                    <span>{work.phone.network}</span>
                    <Wifi size={18} />
                  </div>
                </div>
                <p className="settings-page-caption">
                  连接状态仅用于作品中的虚拟手机。
                </p>
              </>
            )}
          </>
        );
      case "蓝牙":
        return (
          <>
            <div className="settings-group">
              {toggle("蓝牙", bluetooth, setBluetooth)}
            </div>
            <p className="settings-page-caption">
              {bluetooth ? "我的设备" : "蓝牙已关闭"}
            </p>
          </>
        );
      case "电池":
        return (
          <>
            <div className="settings-group">
              {row("电池电量", work.phone.battery + "%")}
              {toggle("低电量模式", lowPower, setLowPower)}
            </div>
            <p className="settings-page-caption">
              低电量模式仅改变虚拟设备状态。
            </p>
          </>
        );
      case "日期与时间":
        return (
          <div className="settings-group">
            {row("日期", work.phone.date || "2026-09-01")}
            {row("时间", work.phone.time)}
            {row("时区", "中国标准时间")}
          </div>
        );
      case "iPhone 储存空间":
        return (
          <div className="settings-group">
            {work.apps
              .filter((a) => a.installed)
              .map((a) => row(a.name, `${work.data[a.id]?.length || 0} 项`))}
          </div>
        );
      case "软件更新":
        return (
          <p className="settings-page-caption">
            iOS 18.0 · 此为作品中的虚拟系统，不下载系统更新。
          </p>
        );
      case "墙纸":
        return (
          <div className="wallpaper-settings">
            <p className="settings-page-caption">为锁定屏幕和主屏幕分别选择照片。照片只保存在当前浏览器中。</p>
            <section className="wallpaper-picker-card">
              <strong>锁定屏幕</strong>
              <div className="wallpaper-preview lock-preview" style={lockWallpaper ? { backgroundImage: `url("${lockWallpaper}")` } : undefined}>
                {!lockWallpaper && <span>锁屏预览</span>}
                {lockWallpaper && <span className="wallpaper-preview-clock">{work.phone.time}</span>}
              </div>
              <label className="wallpaper-upload-button">
                选择锁屏照片
                <input type="file" accept="image/*" onChange={(e) => { void chooseWallpaper("lock", e.currentTarget.files?.[0]); e.currentTarget.value = ""; }} />
              </label>
              {lockWallpaper && <button className="wallpaper-clear-button" onClick={() => clearWallpaper("lock")}>恢复默认</button>}
            </section>
            <section className="wallpaper-picker-card">
              <strong>主屏幕</strong>
              <div className="wallpaper-preview home-preview" style={homeWallpaper ? { backgroundImage: `url("${homeWallpaper}")` } : undefined}>
                {!homeWallpaper && <span>主屏幕预览</span>}
                {homeWallpaper && <span className="wallpaper-preview-icons">● · ● · ●<br/>● · ● · ●<br/>● · ● · ●</span>}
              </div>
              <label className="wallpaper-upload-button">
                选择主屏幕照片
                <input type="file" accept="image/*" onChange={(e) => { void chooseWallpaper("home", e.currentTarget.files?.[0]); e.currentTarget.value = ""; }} />
              </label>
              {homeWallpaper && <button className="wallpaper-clear-button" onClick={() => clearWallpaper("home")}>恢复默认</button>}
            </section>
            {wallpaperError && <p className="wallpaper-error" role="alert">{wallpaperError}</p>}
            <p className="settings-page-caption">提示：在 iPad 的照片选择窗口中选择图片即可。锁屏与主屏幕互不影响。</p>
          </div>
        );
      default:
        return (
          <>
            <div className="settings-group">
              {row(
                nav.page,
                nav.page === "面容 ID 与密码"
                  ? work.phone.passcode
                    ? "已设置密码"
                    : "未设置密码"
                  : "",
              )}
            </div>
            {!items.some((i) => i.folder === nav.page) && (
              <p className="settings-page-caption">此作品没有配置更多选项。</p>
            )}
          </>
        );
    }
  };
  return (
    <div className="native-settings" data-root={!nav.page}>
      <NavigationPage
        page={nav.page}
        back={nav.pop}
        title={nav.depth > 1 ? "通用" : "设置"}
      >
        {nav.page ? (
          sub()
        ) : (
          <>
            <h1>设置</h1>
            {!query && (
              <button
                className="settings-account"
                onClick={() => nav.push(work.phone.owner)}
              >
                <span>{work.phone.owner.slice(0, 1)}</span>
                <div>
                  <strong>{work.phone.owner}</strong>
                  <small>Apple 账户、iCloud 与更多</small>
                </div>
                <ChevronRight size={17} />
              </button>
            )}
            {groups.map((group, n) => (
              <div className="settings-group" key={n}>
                {group
                  .filter(([, name]) => name.includes(query))
                  .map(([Icon, name, color]) => (
                    <div
                      key={name}
                      className="settings-native-row"
                      role={name === "飞行模式" ? undefined : "button"}
                      tabIndex={name === "飞行模式" ? undefined : 0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") nav.push(name);
                      }}
                      onClick={() => {
                        if (name !== "飞行模式") nav.push(name);
                      }}
                    >
                      <span
                        className="settings-glyph"
                        style={{ background: color }}
                      >
                        <Icon size={21} />
                      </span>
                      <span>{name}</span>
                      {name === "飞行模式" ? (
                        <IOSToggle
                          label="飞行模式"
                          checked={airplane}
                          onChange={setAirplane}
                        />
                      ) : (
                        <>
                          <small>
                            {name === "无线局域网"
                              ? wifi
                                ? "未连接"
                                : "关闭"
                              : name === "蓝牙"
                                ? bluetooth
                                  ? "打开"
                                  : "关闭"
                                : name === "VPN"
                                  ? "未连接"
                                  : name === "蜂窝网络" || name === "个人热点"
                                    ? "关闭"
                                    : ""}
                          </small>
                          <ChevronRight size={16} />
                        </>
                      )}
                    </div>
                  ))}
              </div>
            ))}
          </>
        )}
        {items
          .filter(
            (i) =>
              !nav.page || i.folder === nav.page || i.title.includes(nav.page),
          )
          .map((i) => (
            <button className="record-row" key={i.id} onClick={() => onItem(i)}>
              {i.title}
              <ChevronRight size={16} />
            </button>
          ))}
        {creator && (
          <button className="phone-add" onClick={onSettings}>
            编辑系统配置
          </button>
        )}
      </NavigationPage>
      {!nav.page && (
        <label className="settings-search">
          <Search size={23} />
          <input
            aria-label="搜索设置"
            placeholder="搜索"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Mic size={22} aria-hidden="true" />
        </label>
      )}
    </div>
  );
}
