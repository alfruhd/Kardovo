import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from '@headlessui/react';

export default function Modal({
    children,
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose = () => {},
    translucent = false,
    panelClassName = '',
}) {
    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
        '3xl': 'sm:max-w-3xl',
        '4xl': 'sm:max-w-4xl',
        '5xl': 'sm:max-w-5xl',
    }[maxWidth] || 'sm:max-w-2xl';

    const defaultPanelStyle = translucent
        ? 'bg-white/95 backdrop-blur-2xl border border-slate-100 shadow-[0_24px_50px_-12px_rgba(11,37,69,0.25),0_12px_24px_-6px_rgba(11,37,69,0.15)] text-slate-900'
        : 'bg-white/95 backdrop-blur-3xl backdrop-saturate-180 text-slate-900 border border-slate-300/80 shadow-[0_25px_70px_rgba(0,0,0,0.12)]';

    return (
        <Transition show={show} leave="duration-200">
            <Dialog
                as="div"
                id="modal"
                className="fixed inset-0 z-50 flex transform items-center justify-center overflow-y-auto px-4 py-6 transition-all sm:px-0"
                onClose={close}
            >
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className={translucent ? "fixed inset-0 bg-slate-950/60 backdrop-blur-md" : "fixed inset-0 bg-slate-950/75 backdrop-blur-xs"} />
                </TransitionChild>

                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <DialogPanel
                        className={`my-auto max-h-[92vh] flex flex-col transform overflow-hidden rounded-[28px] ${defaultPanelStyle} transition-all sm:mx-auto sm:w-full ${maxWidthClass} ${panelClassName}`}
                    >
                        {children}
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}
