import React from "react";
import { useTranslation } from "react-i18next";
import Dialog from "../Dialog";

export interface NfrModalProps {
	open: boolean;
	cancelLabel?: string;
	confirmLabel?: string;
	cancelable?: boolean;
	onSuccess?: () => void;
	onCancel?: () => void;
	onError?: (error: unknown) => void;
}

const NfrModal: React.FC<NfrModalProps> = ({
	open,
	title,
	cancelLabel,
	confirmLabel,
	cancelable = true,
	onSuccess,
	onCancel,
}) => {
	const { t } = useTranslation(["common"]);

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) return;
		if (!cancelable) return;
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
			title={title}
			closeOnOverlayClick={cancelable}
			closeOnEscape={cancelable}
		>
			<div className="modal-body">
			</div>
			<div className="modal-footer">
				{cancelable && (
					<button className="br-button warning" type="button" onClick={onCancel}>
						{cancelLabel ?? t("Cancel")}
					</button>
				)}
				<button className="br-button" type="button" onClick={onSuccess}>
					{confirmLabel ?? t("Confirm")}
				</button>
			</div>
		</Dialog>
	);
};

export default NfrModal;
