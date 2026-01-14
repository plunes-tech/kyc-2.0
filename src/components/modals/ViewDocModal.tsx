import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, Loader, Modal, ScrollArea } from "@mantine/core";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import type { PDFDocumentProxy, RenderParameters } from "pdfjs-dist/types/src/display/api";
import type { RenderTask } from "pdfjs-dist/types/src/display/api";
import useUploads from "../../hooks/useUploads";

const ViewDocModal: React.FC<{ url: string, setUrl: React.Dispatch<React.SetStateAction<string>> }> = ({ url, setUrl }) => {
    
    GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs";
    let renderTask: RenderTask;

    const { isLoading, getPresignedUrl } = useUploads()

    const [openModal, setOpenModal] = useState(false)

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [scale, setScale] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy>();

    useEffect(() => {
        if (url) {
            setOpenModal(true)

            const FetchPresignedUrl = async () => {
                try {
                    const result = await getPresignedUrl({
                        filePath: url,
                        method: "GET"
                    })
                    if(result.url) {
                        const loadingTask = getDocument(result.url);
                        loadingTask.promise.then(
                            (loadedDoc) => {
                                setPdfDoc(loadedDoc);
                            },
                            (error) => {
                                console.error(error);
                            }
                        );
                    }
                } catch (error) {
                    // handle redux
                }
            }
            FetchPresignedUrl()
        }
    }, [url])

    const renderPage = useCallback(
        (pageNum: number, pdf = pdfDoc, currentScale = scale) => {
            const canvas = canvasRef.current;
            if (!canvas || !pdf) return;

            canvas.height = 0;
            canvas.width = 0;

            pdf
                .getPage(pageNum)
                .then((page) => {
                    const viewport = page.getViewport({ scale: currentScale });
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    const renderContext: RenderParameters = {
                        canvasContext: canvas.getContext("2d")!,
                        viewport: viewport,
                    };

                    try {
                        if (renderTask) {
                            renderTask.cancel();
                        }
                        renderTask = page.render(renderContext);
                        return renderTask.promise;
                    } catch (error) {
                        console.error("Render error:", error);
                    }
                })
                .catch((error) => console.log(error));
        },
        [pdfDoc, scale]
    );

    useEffect(() => {
        renderPage(currentPage, pdfDoc);
    }, [pdfDoc, currentPage, renderPage])

    const nextPage = () => {
        pdfDoc && currentPage < pdfDoc.numPages && setCurrentPage(currentPage + 1);
    }

    const prevPage = () => {
        currentPage > 1 && setCurrentPage(currentPage - 1);
    }

    const handleContextMenu = (event: React.MouseEvent<HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | HTMLIFrameElement, MouseEvent>) => {
        event.preventDefault()
    }

    // Add zoom functions
    const zoomIn = () => {
        setScale(prevScale => Math.min(prevScale + 0.25, 3)); // Max zoom 3x
    };

    const zoomOut = () => {
        setScale(prevScale => Math.max(prevScale - 0.25, 0.5)); // Min zoom 0.5x
    };
    
    return (
        <>
            <Modal opened={openModal} onClose={() => { setOpenModal(false); setUrl("") }} size={"75vw"} fullScreen={window.innerWidth <= 768}
                title={"View Document"} classNames={{
                    content: "!rounded-none md:!rounded-[0.5rem]",
                    header: "!bg-[#39B54A] !py-0 !min-h-[2rem]",
                    title: "!text-[#FFFFFF] !text-[0.9rem] !font-semibold",
                    close: "!text-[#FFFFFF] hover:!bg-transparent",
                }}
            >
                {isLoading && <Box className="flex flex-col items-center p-10">
                    <Loader color="#39B54A" />
                </Box>}
                {!isLoading && 
                <>
                    <div ref={containerRef} className="pdf-container">
                        <div className="flex items-center justify-between my-4">
                            {/* prev button */}
                            <Button size="compact-xs" color="#3E97FF" onClick={prevPage} disabled={currentPage <= 1} classNames={{
                                label: "!text-[0.6rem] sm:!text-[0.7rem] !font-medium"
                            }}>
                                Previous
                            </Button>
                            {/* zoom buttons */}
                            <div className="flex items-center gap-4">
                                <Button size="compact-xs" color="#3E97FF" onClick={zoomOut} disabled={scale <= 0.5} classNames={{
                                    label: "!text-[0.6rem] sm:!text-[0.7rem] !font-medium"
                                }}>
                                    -
                                </Button>
                                <span className="text-[0.6rem] sm:text-[0.7rem] font-medium text-gray-600 text-center">
                                    {Math.round(scale * 100)}%
                                </span>
                                <Button size="compact-xs" color="#3E97FF" onClick={zoomIn} disabled={scale >= 3} classNames={{
                                    label: "!text-[0.6rem] sm:!text-[0.7rem] !font-medium"
                                }}>
                                    +
                                </Button>
                            </div>
                            {/* next button */}
                            <Button size="compact-xs" color="#3E97FF" onClick={nextPage} disabled={currentPage >= (pdfDoc?.numPages ?? -1)} classNames={{
                                label: "!text-[0.6rem] sm:!text-[0.7rem] !font-medium"
                            }}>
                                Next
                            </Button>
                        </div>

                        <ScrollArea h={"65vh"} scrollbarSize={6} className="border rounded">
                            <div className="grid place-content-center">
                                <canvas ref={canvasRef} onContextMenu={handleContextMenu}></canvas>
                            </div>
                        </ScrollArea>
                    </div>
                </>}
            </Modal>
        </>
    )
}

export default ViewDocModal;