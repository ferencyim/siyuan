import {addScript} from "../util/addScript";
import {Constants} from "../../constants";
import {hasClosestByClassName} from "../util/hasClosest";
import {looseJsonParse} from "../../util/functions";
import {genIconHTML} from "./util";

export const chartRender = (element: Element, cdn = Constants.PROTYLE_CDN) => {
    let echartsElements: Element[] = [];
    if (element.getAttribute("data-subtype") === "echarts") {
        // 编辑器内代码块编辑渲染
        echartsElements = [element];
    } else {
        echartsElements = Array.from(element.querySelectorAll('[data-subtype="echarts"]'));
    }
    if (echartsElements.length === 0) {
        return;
    }
    if (echartsElements.length > 0) {
        addScript(`${cdn}/js/echarts/echarts.min.js?v=5.3.2`, "protyleEchartsScript").then(() => {
            addScript(`${cdn}/js/echarts/echarts-gl.min.js?v=2.0.9`, "protyleEchartsGLScript").then(() => {
                const wysiswgElement = hasClosestByClassName(element, "protyle-wysiwyg", true);
                let width: number = undefined;
                if (wysiswgElement && wysiswgElement.clientWidth > 0 && echartsElements[0].firstElementChild.clientWidth === 0 && wysiswgElement.firstElementChild) {
                    width = wysiswgElement.firstElementChild.clientWidth;
                }
                echartsElements.forEach(async (e: HTMLDivElement) => {
                    if (e.getAttribute("data-render") === "true") {
                        return;
                    }
                    if (!e.firstElementChild.classList.contains("protyle-icons")) {
                        e.insertAdjacentHTML("afterbegin", genIconHTML(wysiswgElement));
                    }
                    const renderElement = e.firstElementChild.nextElementSibling as HTMLElement;
                    try {
                        const chartInstance = window.echarts.getInstanceById(renderElement.getAttribute("_echarts_instance_"));
                        const option = await looseJsonParse(Lute.UnEscapeHTMLStr(e.getAttribute("data-content")));
                        if (chartInstance && chartInstance.getOption().series[0]?.type !== option.series[0]?.type) {
                            chartInstance.clear();
                        }
                        renderElement.classList.remove("ft__error");
                        renderElement.style.height = e.style.height;
                        window.echarts.init(renderElement, window.siyuan.config.appearance.mode === 1 ? "dark" : undefined, {width}).setOption(option);
                        e.setAttribute("data-render", "true");
                        if (!renderElement.textContent.endsWith(Constants.ZWSP)) {
                            renderElement.firstElementChild.insertAdjacentText("beforeend", Constants.ZWSP);
                        }
                    } catch (error) {
                        window.echarts.dispose(renderElement);
                        renderElement.classList.add("ft__error");
                        renderElement.innerHTML = `echarts render error: <br>${error}`;
                    }
                });
            });
        });
    }
};
