import React from "react";
import { useTranslation } from "react-i18next";
import Dialog from "../Dialog";

interface ConfirmPolyglotModelingProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
}

const ConfirmPolyglotModeling: React.FC<ConfirmPolyglotModelingProps> = ({
	open,
	onClose,
	onConfirm,
}) => {
	const { t } = useTranslation(["common"]);

	return (
		<Dialog
			open={open}
			onOpenChange={onClose}
			title={t(
				"Are you sure that you want to proceed with the polyglot modeling?",
			)}
			closeOnOverlayClick
			closeOnEscape
			contentStyle={{ backgroundColor: "white" }}
			titleStyle={{
				fontSize: "1.5em",
				fontWeight: "bold",
				marginLeft: "12px",
				padding: "8px",
			}}
		>
			<div className="modal-success-footer">
				<button
					className="polyglot-style-danger-button"
					type="button"
					onClick={onClose}
				>
					{t("Cancel")}
				</button>
				<button
					className="polyglot-style-primary-button"
					type="button"
					onClick={() => {
						onConfirm();
						onClose();
					}}
				>
					{t("Confirm")}
				</button>
			</div>
		</Dialog>
	);
};

export default ConfirmPolyglotModeling;
