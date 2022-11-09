import React, { FC, useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import eventBus from '../../../hoc/eventBus';
import { GET_DOWNLOAD_DOCUMENT } from '../../../networking/httpEndPoints';
import SuccessToaster from '../../../components/SuccessToaster';

interface ResponseType {
  isSuccess: number;
  responseMessage: string;
  result?: any;
}
interface SelectedFile {
  documentId: number;
  downloadStatus: boolean;
}

interface DownloadFile {
  documentId: number;
  documentName: string | null;
  documentS3Name: string | null;
  documentUrl: string | null;
  documentData: string | null;
}

const DownloadDocuments: FC = () => {
    const token = localStorage.getItem('user');
    const [initiateDownload, setInitiateDownload] = useState(false);
    const [receivedDocuments, setReceivedDocuments] = useState<SelectedFile[]>(
        []
    );
    const [downloadDocuments, setDownloadDocuments] = useState<SelectedFile[]>(
        []
    );
    let downloadTimer: any = undefined;
    let messageTimer: any = undefined;
    const [messageToUser, setMessageToUser] = useState('');
    const [showMessageToUser, setShowMessageToUser] = useState(false);
    const [eventInitiated, setEventInitiated] = useState(false);

    useEffect(() => {
        setInitiateDownload(false);
        setReceivedDocuments([]);
        setDownloadDocuments([]);
        setMessageToUser('');
        setShowMessageToUser(false);
    }, []);

    useEffect(() => {
        if (!eventInitiated) {
            setEventInitiated(true);
            addEvents();
            return () => {
                removeEvents();
            };
        }
    }, [eventInitiated]);

    useEffect(() => {
        if (receivedDocuments.length > 0) {
            if (!initiateDownload) {
                localStorage.setItem('stopdownload', 'false');
                setDownloadDocuments(receivedDocuments);
                setInitiateDownload(true);
            } else {
                setMessageToUser('Files download in progress');
                setShowMessageToUser(true);
            }
        }
    }, [receivedDocuments]);

    useEffect(() => {
        if (initiateDownload) {
            if (!downloadTimer) {
                startTimer();
            }
        }
    }, [initiateDownload]);

    useEffect(() => {
        if (showMessageToUser) {
            setTimer();
        } else {
            if (messageTimer) clearTimeout(messageTimer);
        }
    }, [showMessageToUser]);

    const setTimer = () => {
        messageTimer = setTimeout(() => {
            setMessageToUser('');
            setShowMessageToUser(false);
        }, 5000);
    };

    const addEvents = () => {
        eventBus.on('initiateDownload', handledInitiateDownload);
        eventBus.on('stopDownload', handledStopDownload);
    };

    const removeEvents = () => {
        eventBus.remove('initiateDownload');
        eventBus.remove('stopDownload');
    };

    const handledInitiateDownload = (data: any) => {
        setReceivedDocuments(data.downloadFiles);
    };

    const startTimer = () => {
        if (downloadDocuments.length > 0) {
            let downloadCompletedCount = 0;
            let downloadDocumentIndex = 0;
            downloadTimer = setInterval(() => {
                const stopDownload = localStorage.getItem('stopdownload');
                if (stopDownload === 'false') {
                    const downloadStatus = handlDownloadFiles(
                        downloadDocuments[downloadDocumentIndex].documentId
                    );
                    if (downloadStatus)
                        downloadCompletedCount = downloadCompletedCount + 1;
                    downloadDocumentIndex = downloadDocumentIndex + 1;
                    if (downloadDocumentIndex === downloadDocuments.length) {
                        handleDownloadCompleted(downloadCompletedCount);
                    }
                } else {
                    handleDownloadCleanUp();
                }
            }, 15000);
        }
    };

    function handlDownloadFiles(documentId: number): boolean {
        axios
            .get<ResponseType>(`${GET_DOWNLOAD_DOCUMENT}${documentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => {
                if (response.status === 200 && response.data.result) {
                    const organizationDocument = response.data.result;
                    if (organizationDocument) {
                        handleSaveDocument(organizationDocument);
                    }
                } else {
                    Swal.fire({
                        text: 'Something went wrong!',
                        confirmButtonText: 'OK',
                        icon: 'error',
                    });
                    return false;
                }
            });
        return true;
    }

    const handleSaveDocument = (organizationDocument: DownloadFile) => {
        let documentName = '';
        if (organizationDocument.documentName)
            documentName = organizationDocument.documentName;
        let documentData = '';
        if (organizationDocument.documentData)
            documentData = organizationDocument.documentData;
        const bufferArray = base64ToArrayBuffer(documentData);
        const blobStore = new Blob([bufferArray], { type: 'application/pdf' });
        const data = window.URL.createObjectURL(blobStore);
        const link = document.createElement('a');
        document.body.appendChild(link);
        link.href = data;
        link.download = documentName;
        link.click();
        window.URL.revokeObjectURL(data);
        link.remove();
    };

    const base64ToArrayBuffer = (data: string) => {
        const bString = window.atob(data);
        const bLength = bString.length;
        const bytes = new Uint8Array(bLength);
        for (let i = 0; i < bLength; i++) {
            const ascii = bString.charCodeAt(i);
            bytes[i] = ascii;
        }
        return bytes;
    };

    const handleDownloadCompleted = (downloadCount: number) => {
        setMessageToUser(
            `${downloadCount} out of ${downloadDocuments.length} downloaded successfully.`
        );
        setShowMessageToUser(true);
        setReceivedDocuments([]);
        setDownloadDocuments([]);
        setInitiateDownload(false);
        clearInterval(downloadTimer);
        eventBus.dispatch('donwloadCompleted', { actionStatus: true });
    };

    const handledStopDownload = () => {
        localStorage.setItem('stopdownload', 'true');
    };

    const handleDownloadCleanUp = () => {
        clearInterval(downloadTimer);
    };

    return (
        <>
            {showMessageToUser && (
                <SuccessToaster message={messageToUser} />
            )}
        </>
    );
};

export default DownloadDocuments;
